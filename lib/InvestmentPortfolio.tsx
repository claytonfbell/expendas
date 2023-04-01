import {
  alpha,
  Box,
  Grid,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AccountBucket } from "@prisma/client"
import { ResponsiveTable } from "material-ui-pack"
import { useState } from "react"
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
import { displayAccountType } from "./accountTypes"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { AmountInputTool } from "./AmountInputTool"
import { useFetchAccounts, useUpdateAccount } from "./api/api"
import { Currency } from "./Currency"
import { formatMoney } from "./formatMoney"
import { Link } from "./Link"
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
  const totalDeposits = accounts.reduce((a, b) => a + (b.totalDeposits || 0), 0)
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

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ResponsiveContainer width="100%" height={isXs ? 180 : 300}>
            <BarChart width={500} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip
                content={<CustomTooltip />}
                isAnimationActive={false}
                label="name"
                formatter={(x: number) => formatMoney(x * 100)}
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

        <Grid item xs={12}>
          <ResponsiveTable
            size="small"
            striped
            elevation={4}
            rowData={data}
            schema={[
              {
                label: "Retirement Bucket",
                render: (x) => x.name,
              },
              {
                label: "Equity",
                render: (x) => <Currency value={x.equity} />,
                xsDownHidden: true,
              },
              {
                label: "Fixed Income",
                render: (x) => <Currency value={x.fixed} />,
                xsDownHidden: true,
              },
              {
                label: "Total",
                render: (x) => <Currency value={x.equity + x.fixed} />,
              },
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <ResponsiveTable
            size="small"
            striped
            elevation={4}
            rowData={accounts}
            schema={[
              {
                smDownHidden: true,
                label: "Account",
                render: function render(account) {
                  return (
                    <Link onClick={() => setSelectedAccount(account)}>
                      {account.name} {displayAccountType(account.accountType)}
                    </Link>
                  )
                },
              },
              {
                smDownHidden: true,
                label: "Deposits",
                alignRight: true,
                render: function render(account) {
                  const deposits = account.totalDeposits || 0
                  return (
                    <AmountInputTool
                      enabled
                      value={deposits}
                      onChange={(totalDeposits) => {
                        updateAccount({ ...account, totalDeposits })
                      }}
                    />
                  )
                },
              },
              {
                smDownHidden: true,
                label: "Equity",
                alignRight: true,
                render: function render(account) {
                  const fixed = account.totalFixedIncome || 0
                  return <Currency value={account.balance - fixed} />
                },
              },
              {
                smDownHidden: true,
                label: "Fixed Income",
                alignRight: true,
                render: function render(account) {
                  const fixed = account.totalFixedIncome || 0
                  return (
                    <AmountInputTool
                      enabled
                      value={fixed}
                      onChange={(totalFixedIncome) => {
                        updateAccount({ ...account, totalFixedIncome })
                      }}
                    />
                  )
                },
              },
              {
                smDownHidden: true,
                label: "Total Value",
                alignRight: true,
                render: function render(account) {
                  return (
                    <AmountInputTool
                      enabled
                      value={account.balance}
                      onChange={(balance) => {
                        updateAccount({ ...account, balance })
                      }}
                    />
                  )
                },
              },
              {
                smDownHidden: true,
                label: "Gain / Loss",
                alignRight: true,
                render: function render(account) {
                  const deposits = account.totalDeposits || 0
                  return (
                    <Currency
                      arrow
                      green
                      red
                      value={account.balance - deposits}
                      animate
                    />
                  )
                },
              },
              {
                smDownHidden: true,
                label: "Gain / Loss",
                alignRight: true,
                render: function render(account) {
                  const deposits = account.totalDeposits || 0
                  return (
                    <Percentage
                      arrow
                      green
                      red
                      value={(account.balance - deposits) / deposits}
                    />
                  )
                },
              },
            ]}
            totalRow={
              isXs ? (
                <Box padding={1}>
                  <Grid container spacing={1} justifyContent="space-between">
                    <Grid item xs={6}>
                      TOTAL DEPOSITS
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: "right" }}>
                      <Currency value={totalDeposits} />
                    </Grid>
                    <Grid item xs={6}>
                      TOTAL EQUITY
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: "right" }}>
                      <Percentage value={(total - fixed) / total} />
                    </Grid>
                    <Grid item xs={4} style={{ textAlign: "right" }}>
                      <Currency value={total - fixed} />
                    </Grid>
                    <Grid item xs={6}>
                      TOTAL FIXED INCOME
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: "right" }}>
                      <Percentage value={fixed / total} />
                    </Grid>
                    <Grid item xs={4} style={{ textAlign: "right" }}>
                      <Currency value={fixed} />
                    </Grid>
                    <Grid item xs={6}>
                      TOTAL VALUE
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: "right" }}>
                      <Currency value={total} />
                    </Grid>
                    <Grid item xs={6}>
                      GAIN / LOSS
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: "right" }}>
                      <Currency
                        arrow
                        red
                        green
                        value={total - totalDeposits}
                        animate
                      />
                    </Grid>
                    <Grid item xs={6}>
                      GAIN / LOSS
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: "right" }}>
                      <Percentage
                        arrow
                        green
                        red
                        value={(total - totalDeposits) / totalDeposits}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <>
                  <TableRow
                    sx={{
                      "& td": {
                        fontSize: `1.2em`,
                      },
                    }}
                  >
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="right">
                      <Currency value={totalDeposits} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency value={total - fixed} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency value={fixed} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency value={total} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency
                        arrow
                        red
                        green
                        value={total - totalDeposits}
                        animate
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Percentage
                        arrow
                        green
                        red
                        value={(total - totalDeposits) / totalDeposits}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow
                    sx={{
                      "& td": {
                        fontSize: `1.2em`,
                      },
                    }}
                  >
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <Percentage value={(total - fixed) / total} />
                    </TableCell>
                    <TableCell align="right">
                      <Percentage value={fixed / total} />
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              )
            }
          />
        </Grid>
      </Grid>
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
        <Grid item>
          <Typography>{label}</Typography>
        </Grid>
        <Grid item>
          <Typography>
            <Currency value={payload[0].value + payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} justifyContent="space-between">
        <Grid item>
          <Typography style={{ color: payload[0].fill }}>
            {payload[0].name}
          </Typography>
        </Grid>
        <Grid item>
          <Typography style={{ color: payload[0].fill }}>
            <Currency value={payload[0].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} justifyContent="space-between">
        <Grid item>
          <Typography style={{ color: payload[1].fill }}>
            {payload[1].name}
          </Typography>
        </Grid>
        <Grid item>
          <Typography style={{ color: payload[1].fill }}>
            <Currency value={payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
    </Box>
  ) : null
}
