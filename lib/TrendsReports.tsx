import { useTheme } from "@mui/material"
import moment from "moment"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useFetchAccountsWithBalanceHistory } from "./api/api"
import { useGlobalState } from "./GlobalStateProvider"

export function TrendsReports() {
  const { organizationId } = useGlobalState()
  const { data: accounts = [] } =
    useFetchAccountsWithBalanceHistory(organizationId)

  const investmentAccounts = accounts.filter(
    (a) => a.accountType === "Investment"
  )
  const investmentData =
    investmentAccounts.length > 0
      ? investmentAccounts[0].balanceHistory.map((bh) => {
          const balanceSum = investmentAccounts.reduce((acc, account) => {
            const bhForAccount = account.balanceHistory.find(
              (b) => b.date === bh.date
            )
            return acc + (bhForAccount ? bhForAccount.balance : 0)
          }, 0)

          const marketHighSum = investmentAccounts.reduce((acc, account) => {
            const bhForAccount = account.balanceHistory.find(
              (b) => b.date === bh.date
            )
            return (
              acc +
              (bhForAccount && bhForAccount.marketHigh
                ? bhForAccount.marketHigh
                : 0)
            )
          }, 0)

          const marketLowSum = investmentAccounts.reduce((acc, account) => {
            const bhForAccount = account.balanceHistory.find(
              (b) => b.date === bh.date
            )
            return (
              acc +
              (bhForAccount && bhForAccount.marketLow
                ? bhForAccount.marketLow
                : 0)
            )
          }, 0)

          const totalNetWorth = accounts.reduce((acc, account) => {
            const bhForAccount = account.balanceHistory.find(
              (b) => b.date === bh.date
            )
            return acc + (bhForAccount ? bhForAccount.balance : 0)
          }, 0)

          return {
            balance: Math.round(balanceSum / 100),
            marketHigh: Math.round(marketHighSum / 100),
            marketLow: Math.round(marketLowSum / 100),
            totalNetWorth: Math.round(totalNetWorth / 100),
            date: bh.date,
          }
        })
      : []

  const theme = useTheme()

  const highestNetWorth =
    Math.max(...investmentData.map((d) => d.totalNetWorth), 0) + 50_000

  const lowestMarketLow =
    Math.min(...investmentData.map((d) => d.marketLow ?? Infinity), Infinity) -
    50_000

  return (
    <>
      <LineChart
        style={{
          width: "100%",
          maxHeight: "80vh",
          aspectRatio: 1.618,
        }}
        responsive
        data={investmentData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(x) => moment(`${x} 00:00:00`).format("M/D/YYYY")}
        />
        <YAxis
          width="auto"
          tickFormatter={formatCurrency}
          domain={[lowestMarketLow, highestNetWorth]}
        />
        <Tooltip
          formatter={(x) => formatCurrency(parseFloat(x?.toString() ?? "0"))}
        />
        <Legend />

        <Line
          type="monotone"
          dataKey="totalNetWorth"
          stroke={theme.palette.secondary.main}
          strokeWidth={6}
          isAnimationActive={true}
          name="Total Net Worth"
        />

        <Line
          type="monotone"
          dataKey="marketHigh"
          stroke={theme.palette.success.main}
          strokeWidth={6}
          isAnimationActive={true}
          name="Market High"
        />

        <Line
          type="monotone"
          dataKey="balance"
          stroke={theme.palette.primary.main}
          strokeWidth={6}
          isAnimationActive={true}
          name="Investment Balance"
        />

        <Line
          type="monotone"
          dataKey="marketLow"
          stroke={theme.palette.error.main}
          strokeWidth={6}
          isAnimationActive={true}
          name="Market Low"
        />
      </LineChart>
    </>
  )
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0, // Optional: adjust decimal places
    maximumFractionDigits: 0, // Optional: adjust decimal places
  }).format(value)
}
