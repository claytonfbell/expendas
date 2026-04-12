import {
  alpha,
  Box,
  Grid,
  lighten,
  Stack,
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
import { useMeasure } from "react-use"
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

  const [firstCellRef, { width: firstCellWidth }] = useMeasure<HTMLDivElement>()

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <ResponsiveContainer width="100%" height={isXs ? 180 : 300}>
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
                <TableCell>Retirement Bucket</TableCell>
                <TableCell align="right">Equity</TableCell>
                <TableCell align="right">Fixed Income</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.name} hover>
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
            </TableBody>
          </ExpendasTable>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <ExpendasTable>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell align="right">Equity</TableCell>
                <TableCell align="right">Fixed Income</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => {
                const equity = account.balance - (account.totalFixedIncome || 0)
                const fixed = account.totalFixedIncome || 0
                return (
                  <TableRow key={account.id} hover>
                    <TableCell>{account.name}</TableCell>
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

              {/* total row */}
              <TableRow hover>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
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
                <TableCell></TableCell>
                <TableCell align="right">
                  <Percentage value={equity / total} />
                </TableCell>
                <TableCell align="right">
                  <Percentage value={fixed / total} />
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableBody>
          </ExpendasTable>
        </Grid>
      </Grid>

      <BottomStatusBar>
        <Stack direction="row" spacing={4} justifyContent="end">
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
