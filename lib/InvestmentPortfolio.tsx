import {
  Box,
  fade,
  Grid,
  Hidden,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
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

const useStyles = makeStyles((theme) => ({
  table: {
    "& .total-row td": {
      fontSize: `1.2em`,
    },
  },
}))

type Data = {
  name: string
  equity: number
  fixed: number
}

export function InvestmentPortfolio() {
  const classes = useStyles()
  const { data: unfiltered = [] } = useFetchAccounts()
  const accounts = unfiltered.filter((x) =>
    investmentGroup.types.includes(x.accountType)
  )
  const theme = useTheme()
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const isXs = useMediaQuery(theme.breakpoints.down("xs"))
  const data: Data[] = accounts
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .map((x) => {
      const equity = x.balance - (x.totalFixedIncome || 0)
      return {
        name: isLg ? `${x.name} ${displayAccountType(x.accountType)}` : x.name,
        equity,
        fixed: x.totalFixedIncome || 0,
      }
    })

  const equity = accounts.reduce(
    (a, b) => a + b.balance - (b.totalFixedIncome || 0),
    0
  )
  const fixed = accounts.reduce((a, b) => a + (b.totalFixedIncome || 0), 0)
  const totalDeposits = accounts.reduce((a, b) => a + (b.totalDeposits || 0), 0)
  const total = equity + fixed

  const { mutateAsync: updateAccount } = useUpdateAccount()

  const [selectedAccount, setSelectedAccount] = useState<AccountWithIncludes>()

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <ResponsiveContainer width="100%" height={isXs ? 180 : 300}>
            <BarChart width={500} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
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
          <TableContainer component={Paper}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <Hidden xsDown>
                    <TableCell align="right">Deposits</TableCell>
                    <TableCell align="right">Equity</TableCell>
                    <TableCell align="right">Fixed Income</TableCell>
                  </Hidden>
                  <TableCell align="right">Total Value</TableCell>
                  <Hidden xsDown>
                    <TableCell align="right">Gain / Loss</TableCell>
                  </Hidden>
                  <TableCell align="right">
                    <Hidden xsDown>Gain / Loss</Hidden>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => {
                  const deposits = account.totalDeposits || 0
                  const fixed = account.totalFixedIncome || 0

                  return (
                    <TableRow key={account.id}>
                      <TableCell>
                        <Link onClick={() => setSelectedAccount(account)}>
                          {account.name}{" "}
                          {displayAccountType(account.accountType)}
                        </Link>
                      </TableCell>
                      <Hidden xsDown>
                        <TableCell align="right">
                          <AmountInputTool
                            enabled
                            value={deposits}
                            onChange={(totalDeposits) => {
                              updateAccount({ ...account, totalDeposits })
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Currency value={account.balance - fixed} />
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
                      </Hidden>
                      <TableCell align="right">
                        <AmountInputTool
                          enabled
                          value={account.balance}
                          onChange={(balance) => {
                            updateAccount({ ...account, balance })
                          }}
                        />
                      </TableCell>
                      <Hidden xsDown>
                        <TableCell align="right">
                          <Currency
                            arrow
                            green
                            red
                            value={account.balance - deposits}
                            animate
                          />
                        </TableCell>
                      </Hidden>
                      <TableCell align="right">
                        <Percentage
                          arrow
                          green
                          red
                          value={(account.balance - deposits) / deposits}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}

                <TableRow className="total-row">
                  <TableCell>TOTAL</TableCell>
                  <Hidden xsDown>
                    <TableCell align="right">
                      <Currency value={totalDeposits} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency value={total - fixed} />
                    </TableCell>
                    <TableCell align="right">
                      <Currency value={fixed} />
                    </TableCell>
                  </Hidden>
                  <TableCell align="right">
                    <Currency value={total} />
                  </TableCell>
                  <Hidden xsDown>
                    <TableCell align="right">
                      <Currency
                        arrow
                        red
                        green
                        value={total - totalDeposits}
                        animate
                      />
                    </TableCell>
                  </Hidden>
                  <TableCell align="right">
                    <Percentage
                      arrow
                      green
                      red
                      value={(total - totalDeposits) / totalDeposits}
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="total-row">
                  <TableCell></TableCell>
                  <Hidden xsDown>
                    <TableCell></TableCell>
                    <TableCell align="right">
                      <Percentage value={(total - fixed) / total} />
                    </TableCell>
                    <TableCell align="right">
                      <Percentage value={fixed / total} />
                    </TableCell>
                  </Hidden>
                  <TableCell></TableCell>
                  <Hidden xsDown>
                    <TableCell></TableCell>
                  </Hidden>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
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

const useCustomTooltipStyles = makeStyles((theme) => ({
  root: {
    color: "#ffffff",
    borderRadius: 5,
    backgroundColor: fade("#000", 0.9),
    boxShadow: `5px 11px 22px 1px rgba(0,0,0,0.43)`,
  },
}))

function CustomTooltip({ payload, label, active }: CustomTooltipProps) {
  const classes = useCustomTooltipStyles()
  return active && payload !== undefined ? (
    <Box className={classes.root} padding={1}>
      <Grid container spacing={3} justify="space-between">
        <Grid item>
          <Typography>{label}</Typography>
        </Grid>
        <Grid item>
          <Typography>
            <Currency value={payload[0].value + payload[1].value} />
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1} justify="space-between">
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
      <Grid container spacing={1} justify="space-between">
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
