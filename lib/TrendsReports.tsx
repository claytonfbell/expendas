import { useTheme } from "@mui/material"
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

          return {
            balance: Math.round(balanceSum / 100),
            marketHigh: Math.round(marketHighSum / 100),
            date: bh.date,
          }
        })
      : []

  const theme = useTheme()

  return (
    <>
      <LineChart
        style={{
          width: "100%",
          maxHeight: "400px",
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
        <XAxis dataKey="date" />
        <YAxis width="auto" tickFormatter={formatCurrency} />
        <Tooltip
        //formatter={formatCurrency}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={theme.palette.primary.main}
          strokeWidth={6}
          isAnimationActive={true}
        />
        <Line
          type="monotone"
          dataKey="marketHigh"
          stroke={theme.palette.success.main}
          strokeWidth={6}
          isAnimationActive={true}
        />
      </LineChart>

      <pre>{JSON.stringify(accounts, null, 2)}</pre>
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
