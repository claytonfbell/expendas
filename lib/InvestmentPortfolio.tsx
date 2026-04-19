import {
  alpha,
  Box,
  Chip,
  Grid,
  lighten,
  Stack,
  styled,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AccountBucket } from "@prisma/client"
import React, { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { displayAccountBucket } from "./accountBuckets"
import { AccountDialog } from "./AccountDialog"
import { investmentGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { AmountInputTool } from "./AmountInputTool"
import AnimatedCounter from "./AnimatedCounter"
import {
  useFetchAccounts,
  useFetchTickerPrices,
  useUpdateAccount,
} from "./api/api"
import { BottomStatusBar } from "./BottomStatusBar"
import { Currency } from "./Currency"
import { ExpendasTable } from "./ExpendasTable"
import { HorizontalRangeBar } from "./HorizontalRangeBar"
import { Percentage } from "./Percentage"
import { PercentInputTool } from "./PercentInputTool"

type Data = {
  name: AccountBucket
  equity: number
  fixed: number
}

export function InvestmentPortfolio() {
  const theme = useTheme()
  const { data: unfiltered = [] } = useFetchAccounts()
  const accounts = unfiltered.filter((x) =>
    investmentGroup.types.includes(x.accountType)
  )
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const data = accounts
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .map((x) => {
      const equity = x.balance - (x.totalFixedIncome || 0)
      return {
        name: x.accountBucket || "After_Tax",
        equity,
        fixed: x.totalFixedIncome || 0,
      }
    })
    .reduce((a: Data[], b) => {
      const existing = a.find((x) => x.name === b.name)
      if (existing) {
        existing.equity += b.equity
        existing.fixed += b.fixed
      } else {
        a.push(b)
      }
      return a
    }, [])
    .map((x) => ({ ...x, name: displayAccountBucket(x.name) }))

  const equity = accounts.reduce(
    (a, b) => a + b.balance - (b.totalFixedIncome || 0),
    0
  )
  const fixed = accounts.reduce((a, b) => a + (b.totalFixedIncome || 0), 0)
  const total = equity + fixed

  const { mutateAsync: updateAccount } = useUpdateAccount()

  const [selectedAccount, setSelectedAccount] = useState<AccountWithIncludes>()

  const totalRothAndHSA = accounts.reduce(
    (a, b) => a + (b.accountBucket === "Roth_And_HSA" ? b.balance : 0),
    0
  )
  const totalTraditional = accounts.reduce(
    (a, b) => a + (b.accountBucket === "Traditional" ? b.balance : 0),
    0
  )

  const totalAfterTax = accounts.reduce(
    (a, b) => a + (b.accountBucket === "After_Tax" ? b.balance : 0),
    0
  )

  const { data: tickerPrices } = useFetchTickerPrices()
  const marketHighEquity = React.useMemo(() => {
    if (tickerPrices) {
      return (equity / tickerPrices.currentPrice) * tickerPrices.allTimeHigh
    }
    return undefined
  }, [equity, tickerPrices])

  const marketHighTotal = React.useMemo(() => {
    if (marketHighEquity) {
      return marketHighEquity + fixed
    }
    return undefined
  }, [marketHighEquity, fixed])

  const marketTwoYearLowEquity = React.useMemo(() => {
    if (tickerPrices) {
      return (equity / tickerPrices.currentPrice) * tickerPrices.twoYearLow
    }
    return undefined
  }, [equity, tickerPrices])

  const marketTwoYearLowTotal = React.useMemo(() => {
    if (marketTwoYearLowEquity) {
      return marketTwoYearLowEquity + fixed
    }
    return undefined
  }, [marketTwoYearLowEquity, fixed])

  const maxWidth = 250

  // persist target equity percentage in local storage
  const [targetEquityPercentage, setTargetEquityPercentage] = useState(() => {
    const value = localStorage.getItem("targetEquityPercentage") || "0.9"
    return parseFloat(value)
  })
  React.useEffect(() => {
    localStorage.setItem(
      "targetEquityPercentage",
      targetEquityPercentage.toString()
    )
  }, [targetEquityPercentage])

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Box maxWidth={600}>
            <ResponsiveContainer width={"100%"} height={isXs ? 180 : 180}>
              <BarChart width={500} height={300} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip
                  content={<CustomTooltip />}
                  isAnimationActive={false}
                  // label="name"
                  // formatter={(x: number) => formatMoney(x * 100)}
                />
                <Bar
                  dataKey="equity"
                  stackId="a"
                  fill={theme.palette.primary.main}
                  name="Equity"
                />
                <Bar
                  dataKey="fixed"
                  stackId="a"
                  fill={theme.palette.secondary.main}
                  name="Fixed Income"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <HorizontalRangeBar
            low={marketTwoYearLowTotal ?? 0}
            current={total}
            high={marketHighTotal ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ExpendasTable>
            <TableHead>
              <TableRow>
                <TableCell sx={{ maxWidth }}>Account</TableCell>
                <TableCell sx={{ maxWidth }}>Retirement Bucket</TableCell>
                <TableCell align="right">Equity</TableCell>
                <TableCell align="right">Fixed Income</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts
                .filter((x) => x.balance > 0)
                .map((account) => {
                  const equity =
                    account.balance - (account.totalFixedIncome || 0)
                  const fixed = account.totalFixedIncome || 0
                  return (
                    <TableRow key={account.id} hover>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        {account.accountBucket &&
                          displayAccountBucket(account.accountBucket)}
                      </TableCell>
                      <TableCell align="right">
                        <Currency value={equity} />
                      </TableCell>
                      <TableCell align="right">
                        <AmountInputTool
                          enabled
                          value={fixed}
                          onChange={(totalFixedIncome) => {
                            updateAccount({ ...account, totalFixedIncome })
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <AmountInputTool
                          enabled
                          value={account.balance}
                          onChange={(balance) => {
                            updateAccount({ ...account, balance })
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              <TableRow>
                <TableCell colSpan={5}>&nbsp;</TableCell>
              </TableRow>
            </TableBody>
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell sx={{ maxWidth }}>Retirement Bucket</TableCell>
                <TableCell align="right">Equity</TableCell>
                <TableCell align="right">Fixed Income</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.name} hover>
                  <TableCell>&nbsp;</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right">
                    <Currency value={row.equity} />
                  </TableCell>
                  <TableCell align="right">
                    <Currency value={row.fixed} />
                  </TableCell>
                  <TableCell align="right">
                    <Currency value={row.equity + row.fixed} />
                  </TableCell>
                </TableRow>
              ))}

              {/* total row */}
              <TableRow hover>
                <TableCell colSpan={2}></TableCell>
                <TableCell align="right">
                  <strong>
                    <Currency value={equity} />
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    <Currency value={fixed} />
                  </strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    <Currency value={total} />
                  </strong>
                </TableCell>
              </TableRow>

              {/* percentage row */}
              <TableRow hover>
                <TableCell colSpan={2}></TableCell>
                <TableCell
                  align="right"
                  sx={{
                    // color red if off by 4% or more of the target
                    color:
                      Math.abs(equity / total - targetEquityPercentage) > 0.04
                        ? theme.palette.error.main
                        : undefined,
                  }}
                >
                  <Percentage value={equity / total} />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    // color red if off by 4% or more of the target
                    color:
                      Math.abs(fixed / total - (1 - targetEquityPercentage)) >
                      0.04
                        ? theme.palette.error.main
                        : undefined,
                  }}
                >
                  <Percentage value={fixed / total} />
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>

              {/* target allocation row  */}
              <TableRow hover>
                <TableCell></TableCell>
                <TableCell>Target Allocation</TableCell>
                <TableCell align="right">
                  <StyledSpan
                    sx={{
                      fontFamily: `'Roboto Mono', monospace`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <PercentInputTool
                      enabled
                      value={targetEquityPercentage * 10_000}
                      onChange={(value) =>
                        setTargetEquityPercentage(value / 10_000)
                      }
                    />
                  </StyledSpan>
                </TableCell>
                <TableCell align="right">
                  <Percentage value={1 - targetEquityPercentage} />
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>

              {/* target amounts */}
              <TableRow hover>
                <TableCell></TableCell>
                <TableCell>Target Amounts</TableCell>
                <TableCell align="right">
                  <Currency value={total * targetEquityPercentage} />
                </TableCell>
                <TableCell align="right">
                  <Currency value={total * (1 - targetEquityPercentage)} />
                </TableCell>
                <TableCell align="right">
                  {/* suggesting to buy or sell to reach target allocation */}
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="end"
                    alignItems="center"
                  >
                    <Chip
                      label={
                        total * targetEquityPercentage - equity > 0
                          ? "Buy"
                          : "Sell"
                      }
                      size="small"
                      color={
                        total * targetEquityPercentage - equity > 0
                          ? "success"
                          : "error"
                      }
                      variant="outlined"
                    />
                    <Currency
                      value={total * targetEquityPercentage - equity}
                      green
                      red
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </ExpendasTable>
        </Grid>
      </Grid>

      <BottomStatusBar>
        <Stack direction="row" spacing={4} justifyContent="end">
          <Stack alignItems={"end"}>
            <Typography>Stocks</Typography>
            <Percentage value={equity / total} decimals={0} />
          </Stack>

          <Stack alignItems={"end"}>
            <Typography>Bonds</Typography>
            <Percentage value={fixed / total} decimals={0} />
          </Stack>

          <Stack alignItems={"end"}>
            <Typography>Savings</Typography>
            <AnimatedCounter value={total} roundNearestDollar />
          </Stack>
        </Stack>
      </BottomStatusBar>

      <AccountDialog
        account={selectedAccount}
        onClose={() => setSelectedAccount(undefined)}
      />
    </>
  )
}

const StyledSpan = styled("span")``

interface CustomTooltipProps {
  payload?: [TooltipPayload, TooltipPayload]
  label?: any
  active?: boolean
}

type TooltipPayload = {
  color: string
  dataKey: string
  fill: string
  formatter: unknown
  name: string
  payload: TooltipPayloadValues
  type: unknown
  unit: unknown
  value: number
}

type TooltipPayloadValues = {
  equity: number
  fixed: number
  name: string
}

function CustomTooltip({ payload, label, active }: CustomTooltipProps) {
  return active && payload !== undefined ? (
    <Box
      sx={{
        color: "#ffffff",
        borderRadius: 5,
        backgroundColor: alpha("#000", 0.9),
        boxShadow: `5px 11px 22px 1px rgba(0,0,0,0.43)`,
      }}
      padding={1}
    >
      <Grid container spacing={3} justifyContent="space-between">
        <Grid>
          <Typography>{label}</Typography>
        </Grid>
        <Grid>
          <Typography>
            <Currency value={payload[0].value + payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} justifyContent="space-between">
        <Grid>
          <Typography style={{ color: lighten(payload[0].fill, 0.5) }}>
            {payload[0].name}
          </Typography>
        </Grid>
        <Grid>
          <Typography style={{ color: lighten(payload[0].fill, 0.5) }}>
            <Currency value={payload[0].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} justifyContent="space-between">
        <Grid>
          <Typography style={{ color: lighten(payload[1].fill, 0.3) }}>
            {payload[1].name}
          </Typography>
        </Grid>
        <Grid>
          <Typography style={{ color: lighten(payload[1].fill, 0.3) }}>
            <Currency value={payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
    </Box>
  ) : null
}
