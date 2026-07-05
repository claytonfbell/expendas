import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Grid,
  lighten,
  Stack,
  styled,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AccountBucket } from "@prisma/client"
import dayjs from "dayjs"
import React, { useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AccountBucketChip } from "./AccountBucketChip"
import { displayAccountBucket } from "./accountBuckets"
import { AssetDialog } from "./AssetDialog"
import { investmentGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import AnimatedCounter from "./AnimatedCounter"
import { useFetchAccounts } from "./api/hooks/useFetchAccounts"
import { useFetchTickerPrices } from "./api/hooks/useFetchTickerPrices"
import { GlidePathRebalanceSchedule } from "./AssetAllocationGlidePath/GlidePathRebalanceSchedule"
import { getTargetEquityPercentageWithGlidePaths } from "./AssetAllocationGlidePath/glidePaths"
import { useAllRebalanceDates } from "./AssetAllocationGlidePath/useAllRebalanceDates"
import { BottomStatusBar } from "./BottomStatusBar"
import { Currency } from "./Currency"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney, formatPercentage } from "./formatMoney"
import { useGlobalState } from "./GlobalStateProvider"
import { HorizontalRangeBar } from "./HorizontalRangeBar"
import { Percentage } from "./Percentage"
import { getTickerDisplayName } from "./tickerDisplayNames"

type Data = {
  name: AccountBucket
  equity: number
  fixed: number
  bucket: AccountBucket | null
}

function getFixedIncome(account: AccountWithIncludes): number {
  return account.assets
    .filter((a) => a.assetType === "Fixed_Income")
    .reduce((sum, a) => sum + a.balance, 0)
}

export function InvestmentPortfolio() {
  const theme = useTheme()
  const { organization } = useGlobalState()
  const { data: unfiltered } = useFetchAccounts()
  const accounts = unfiltered.filter((x) =>
    investmentGroup.types.includes(x.accountType)
  )
  const data = accounts
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .map((x) => {
      const fixedInc = getFixedIncome(x)
      const equity = x.balance - fixedInc
      return {
        name: x.accountBucket || "After_Tax",
        bucket: x.accountBucket,
        equity,
        fixed: fixedInc,
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
    .map((x) => ({
      ...x,
      name: displayAccountBucket(x.name),
      bucket: x.bucket,
    }))

  const equity = accounts.reduce(
    (a, b) => a + b.balance - getFixedIncome(b),
    0
  )
  const fixed = accounts.reduce((a, b) => a + getFixedIncome(b), 0)
  const total = equity + fixed

  if (total === 0) {
    return null
  }

  const [selectedAccount, setSelectedAccount] = useState<AccountWithIncludes>()

  const allTickers = useMemo(() => {
    return [...new Set(accounts.flatMap((a) => a.assets.map((asset) => asset.ticker)))]
  }, [accounts])

  const { data: tickerPrices } = useFetchTickerPrices(allTickers)
  const marketHighEquity = React.useMemo(() => {
    return accounts.reduce((sum, account) => {
      return (
        sum +
        account.assets
          .filter((a) => a.assetType === "Equity")
          .reduce((assetSum, asset) => {
            const prices = tickerPrices[asset.ticker]
            if (!prices || prices.currentPrice === 0) return assetSum + asset.balance
            return (
              assetSum +
              Math.round(
                (asset.balance / prices.currentPrice) * prices.allTimeHigh
              )
            )
          }, 0)
      )
    }, 0)
  }, [accounts, tickerPrices])

  const marketHighTotal = React.useMemo(() => {
    return marketHighEquity + fixed
  }, [marketHighEquity, fixed])

  const marketTwoYearLowEquity = React.useMemo(() => {
    return accounts.reduce((sum, account) => {
      return (
        sum +
        account.assets
          .filter((a) => a.assetType === "Equity")
          .reduce((assetSum, asset) => {
            const prices = tickerPrices[asset.ticker]
            if (!prices || prices.currentPrice === 0) return assetSum + asset.balance
            return (
              assetSum +
              Math.round(
                (asset.balance / prices.currentPrice) * prices.twoYearLow
              )
            )
          }, 0)
      )
    }, 0)
  }, [accounts, tickerPrices])

  const marketTwoYearLowTotal = React.useMemo(() => {
    return marketTwoYearLowEquity + fixed
  }, [marketTwoYearLowEquity, fixed])

  const maxWidth = 250

  const targetEquityPercentage = useMemo(() => {
    return getTargetEquityPercentageWithGlidePaths(dayjs())
  }, [])

  const allRebalanceDates = useAllRebalanceDates()
  const nextRebalanceDate = allRebalanceDates[0]

  //   const [targetEquityPercentage, setTargetEquityPercentage] = useState(
  //     organization?.targetEquityPercentage
  //       ? organization.targetEquityPercentage / 10_000
  //       : 0.9
  //   )
  //   useEffect(() => {
  //     if (organization) {
  //       setTargetEquityPercentage(organization.targetEquityPercentage / 10_000)
  //     }
  //   }, [organization])

  //   const { mutateAsync: updateOrganization } = useUpdateOrganization()
  //   useDebounce(
  //     () => {
  //       if (organization) {
  //         updateOrganization({
  //           ...organization,
  //           targetEquityPercentage: Math.round(targetEquityPercentage * 10_000),
  //         })
  //       }
  //     },
  //     500,
  //     [targetEquityPercentage]
  //   )

  // if the current equity percentage is off by more than 4% from the target, show a warning
  const {
    rebalanceMessage,
    isOutsideTargetThreshold,
    isWithinOnePercentOfTarget,
  } = useMemo(() => {
    const offTargetBy = Math.abs(equity / total - targetEquityPercentage)
    const isOutsideTargetThreshold = offTargetBy > 0.04
    const isWithinOnePercentOfTarget = offTargetBy <= 0.01
    const rebalanceEquityAmount = total * targetEquityPercentage - equity
    const targetPortfolio: string = `${Math.round(targetEquityPercentage * 100)}/${Math.round((1 - targetEquityPercentage) * 100)}`
    const toReachMessage = `To reach your target allocation of **${targetPortfolio}**, you will ${rebalanceEquityAmount > 0 ? "buy" : "sell"} **${formatMoney(Math.abs(rebalanceEquityAmount), true)}** of stocks at the next rebalance date (${nextRebalanceDate.format("l")}).`

    const rebalanceMessage: string = isWithinOnePercentOfTarget
      ? `Your portfolio is only **${formatPercentage(offTargetBy, false)}** off your target allocation. You can skip rebalancing on the next rebalance date (${nextRebalanceDate.format("l")}) if you want.

${toReachMessage}`
      : !isOutsideTargetThreshold
        ? `${toReachMessage}`
        : `Your portfolio is outside of your target allocation by **${formatPercentage(offTargetBy, false)}**. Consider ${rebalanceEquityAmount > 0 ? "buying" : "selling"} **${formatMoney(Math.abs(rebalanceEquityAmount), true)}** of stocks to get back to your target allocation of **${targetPortfolio}**.`

    return {
      rebalanceMessage,
      isOutsideTargetThreshold,
      isWithinOnePercentOfTarget,
    }
  }, [equity, total, targetEquityPercentage])

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ResponsiveContainer width={"100%"} height={160}>
            <BarChart width={500} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis hide />
              <RechartTooltip
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

        <Grid size={{ xs: 12, md: 6 }}>
          <HorizontalRangeBar
            low={marketTwoYearLowTotal ?? 0}
            current={total}
            high={marketHighTotal ?? 0}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack spacing={2}>
            <ExpendasTable>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ maxWidth }}>Account</TableCell>
                  <TableCell sx={{ maxWidth }}>Retirement Bucket</TableCell>
                  <TableCell sx={{ maxWidth }}>Investments</TableCell>
                  <TableCell align="right">Equity</TableCell>
                  <TableCell align="right">Fixed Income</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts
                  .filter((x) => x.balance > 0)
                  .map((account) => {
                    const fixedInc = getFixedIncome(account)
                    const equityVal = account.balance - fixedInc
                    const tickers = [
                      ...new Set(account.assets.map((a) => a.ticker)),
                    ]
                    const tickerBalances: Record<string, number> = {}
                    account.assets.forEach((a) => {
                      tickerBalances[a.ticker] =
                        (tickerBalances[a.ticker] || 0) + a.balance
                    })
                    return (
                      <TableRow key={account.id} hover>
                        <TableCell>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => setSelectedAccount(account)}
                          >
                            {account.name}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <AccountBucketChip bucket={account.accountBucket} />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            {tickers.map((ticker) => (
                              <Tooltip
                                key={ticker}
                                title={formatMoney(tickerBalances[ticker] || 0)}
                              >
                                <Chip
                                  label={getTickerDisplayName(ticker)}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Currency value={equityVal} />
                        </TableCell>
                        <TableCell align="right">
                          <Currency value={fixedInc} />
                        </TableCell>
                        <TableCell align="right">
                          <Currency value={account.balance} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                <TableRow>
                  <TableCell colSpan={6}>&nbsp;</TableCell>
                </TableRow>
              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell sx={{ maxWidth }}>Retirement Bucket</TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">Equity</TableCell>
                  <TableCell align="right">Fixed Income</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.name} hover>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell>
                      <AccountBucketChip bucket={row.bucket} />
                    </TableCell>
                    <TableCell></TableCell>
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
                  <TableCell colSpan={3}></TableCell>
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

                <TableRow>
                  <TableCell colSpan={6}>&nbsp;</TableCell>
                </TableRow>

                {/* percentage row */}
                <TableRow hover>
                  <TableCell></TableCell>
                  <TableCell>Current Allocation</TableCell>
                  <TableCell></TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      // color red if off by 4% or more of the target
                      color: isOutsideTargetThreshold
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
                      color: isOutsideTargetThreshold
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
                  <TableCell></TableCell>
                  <TableCell align="right">
                    <StyledSpan
                      sx={{
                        fontFamily: `'Roboto Mono', monospace`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Percentage value={targetEquityPercentage} />
                      {/* <PercentInputTool
                        enabled
                        value={Math.round(targetEquityPercentage * 10_000)}
                        onChange={(value) =>
                          setTargetEquityPercentage(value / 10_000)
                        }
                      /> */}
                    </StyledSpan>
                  </TableCell>
                  <TableCell align="right">
                    <StyledSpan
                      sx={{
                        fontFamily: `'Roboto Mono', monospace`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Percentage value={1 - targetEquityPercentage} />
                      {/* <PercentInputTool
                        enabled
                        value={Math.round(
                          (1 - targetEquityPercentage) * 10_000
                        )}
                        onChange={(value) =>
                          setTargetEquityPercentage(1 - value / 10_000)
                        }
                      /> */}
                    </StyledSpan>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>

                {/* target amounts */}
                <TableRow hover>
                  <TableCell></TableCell>
                  <TableCell>Target Amounts</TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">
                    <Currency value={total * targetEquityPercentage} />
                  </TableCell>
                  <TableCell align="right">
                    <Currency value={total * (1 - targetEquityPercentage)} />
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableBody>
            </ExpendasTable>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          {/* suggesting to buy or sell to reach target allocation */}
          <CustomAlert
            severity={
              isWithinOnePercentOfTarget
                ? "success"
                : isOutsideTargetThreshold
                  ? "warning"
                  : "info"
            }
            variant="outlined"
            icon={isMobile ? false : undefined}
          >
            <Stack spacing={2}>
              <Typography
                component="div"
                sx={{
                  "& p": {
                    margin: 0,
                  },
                }}
              >
                <ReactMarkdown>{rebalanceMessage}</ReactMarkdown>
              </Typography>
              <GlidePathRebalanceSchedule />
            </Stack>
          </CustomAlert>
        </Grid>
      </Grid>
      <BottomStatusBar>
        <Stack
          direction="row"
          spacing={4}
          sx={{
            justifyContent: "end",
          }}
        >
          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Typography>Stocks</Typography>
            <Percentage value={equity / total} decimals={0} />
          </Stack>

          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Typography>Bonds</Typography>
            <Percentage value={fixed / total} decimals={0} />
          </Stack>

          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Typography>Savings</Typography>
            <AnimatedCounter value={total} roundNearestDollar />
          </Stack>
        </Stack>
      </BottomStatusBar>
      <AssetDialog
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
        padding: 1,
        color: "#ffffff",
        borderRadius: 5,
        backgroundColor: alpha("#000", 0.9),
        boxShadow: `5px 11px 22px 1px rgba(0,0,0,0.43)`,
      }}
    >
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "space-between",
        }}
      >
        <Grid>
          <Typography>{label}</Typography>
        </Grid>
        <Grid>
          <Typography>
            <Currency value={payload[0].value + payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={1}
        sx={{
          justifyContent: "space-between",
        }}
      >
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
      <Grid
        container
        spacing={1}
        sx={{
          justifyContent: "space-between",
        }}
      >
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

const CustomAlert = styled(Alert)`
  background-color: ${(props) =>
    alpha(props.theme.palette[props.severity ?? "info"].light, 0.1)};
`
