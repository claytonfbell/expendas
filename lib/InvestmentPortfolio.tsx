import { Box, Grid, Paper, useMediaQuery, useTheme } from "@material-ui/core"
import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { investmentGroup } from "./AccountGroup"
import { displayAccountType } from "./accountTypes"
import { useFetchAccounts } from "./api/api"
import { Currency } from "./Currency"
import { formatMoney } from "./formatMoney"
import { Percentage } from "./Percentage"

type Data = {
  name: string
  equity: number
  fixed: number
}

export function InvestmentPortfolio() {
  const { data: unfiltered = [] } = useFetchAccounts()
  const accounts = unfiltered.filter((x) =>
    investmentGroup.types.includes(x.accountType)
  )
  const theme = useTheme()
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const data: Data[] = accounts
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
    .map((x) => {
      const equity = (x.balance - (x.totalFixedIncome || 0)) / 100
      return {
        name: isLg ? `${x.name} ${displayAccountType(x.accountType)}` : x.name,
        equity,
        fixed: (x.totalFixedIncome || 0) / 100,
      }
    })

  const equity = accounts.reduce(
    (a, b) => a + b.balance - (b.totalFixedIncome || 0),
    0
  )
  const fixed = accounts.reduce((a, b) => a + (b.totalFixedIncome || 0), 0)
  const totalDeposits = accounts.reduce((a, b) => a + (b.totalDeposits || 0), 0)
  const total = equity + fixed

  return (
    <>
      <ResponsiveContainer width="100%" height={600}>
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis hide />
          <Tooltip
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined">
            <Box padding={2}>
              <Grid container spacing={2} justify="space-between">
                <Grid item xs={4}>
                  Equity
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
                  <Currency value={equity} />
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
                  <Percentage value={equity / total} />
                </Grid>
                <Grid item xs={4}>
                  Fixed Income
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
                  <Currency value={fixed} />
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
                  <Percentage value={fixed / total} />
                </Grid>
                <Grid item xs={4}>
                  TOTAL
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}>
                  <Currency value={total} />
                </Grid>
                <Grid item xs={4} style={{ textAlign: "right" }}></Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined">
            <Box padding={2}>
              <Grid container spacing={2} justify="space-between">
                {accounts.map((account) => (
                  <React.Fragment key={account.id}>
                    <Grid item xs={4}>
                      {account.name} {displayAccountType(account.accountType)}
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "right" }}>
                      <Currency value={account.totalDeposits || 0} />
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "right" }}>
                      <Currency value={account.balance} />
                    </Grid>
                    <Grid item xs={2} style={{ textAlign: "right" }}>
                      <Percentage
                        green
                        red
                        value={
                          (account.balance - (account.totalDeposits || 0)) /
                          (account.totalDeposits || 0)
                        }
                      />
                    </Grid>
                  </React.Fragment>
                ))}

                <Grid item xs={4}>
                  TOTAL
                </Grid>
                <Grid item xs={3} style={{ textAlign: "right" }}>
                  <Currency value={totalDeposits} />
                </Grid>
                <Grid item xs={3} style={{ textAlign: "right" }}>
                  <Currency value={total} />
                </Grid>

                <Grid item xs={2} style={{ textAlign: "right" }}>
                  <Percentage
                    green
                    red
                    value={(total - totalDeposits) / totalDeposits}
                  />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}
