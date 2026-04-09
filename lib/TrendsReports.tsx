import { Stack, useMediaQuery, useTheme } from "@mui/material"
import moment from "moment"
import { useEffect, useState } from "react"
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
import {
  ReportRange,
  TrendsReportsTimeRangeSelect,
} from "./TrendsReportsTimeRangeSelect"

export function TrendsReports() {
  const { organizationId } = useGlobalState()

  const [selectedRange, setSelectedRange] = useState<ReportRange>(() => {
    const storedRange = localStorage.getItem("TrendsReports.selectedRange")
    return storedRange ? (storedRange as ReportRange) : "YTD"
  })

  useEffect(() => {
    localStorage.setItem("TrendsReports.selectedRange", selectedRange)
  }, [selectedRange])

  const { data: accounts = [] } = useFetchAccountsWithBalanceHistory(
    organizationId,
    selectedRange
  )

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

  const isXs = useMediaQuery(theme.breakpoints.down("sm"))
  const strokeWidth = isXs ? 3 : 6

  return (
    <Stack spacing={3}>
      <Stack alignItems={"center"}>
        <TrendsReportsTimeRangeSelect
          value={selectedRange}
          onChange={setSelectedRange}
        />
      </Stack>
      <Stack>
        <LineChart
          style={{
            width: "100%",
            maxHeight: "80vh",
            aspectRatio: 1,
          }}
          responsive
          data={investmentData}
          margin={{
            top: 5,
            right: isXs ? 0 : 30,
            left: isXs ? 0 : 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(x) => moment(`${x} 00:00:00`).format("M/D/YYYY")}
            stroke={theme.palette.text.primary}
          />
          <YAxis
            width="auto"
            tickFormatter={formatCurrency}
            domain={[lowestMarketLow, highestNetWorth]}
            hide={isXs}
            stroke={theme.palette.text.primary}
          />
          <Tooltip
            formatter={(x) => formatCurrency(parseFloat(x?.toString() ?? "0"))}
            itemSorter={(item) => {
              if (item.dataKey === "totalNetWorth") {
                return 0
              } else if (item.dataKey === "marketHigh") {
                return 1
              } else if (item.dataKey === "balance") {
                return 2
              } else if (item.dataKey === "marketLow") {
                return 3
              } else {
                return 4
              }
            }}
          />
          <Legend />

          <Line
            type="monotone"
            dataKey="totalNetWorth"
            stroke={theme.palette.secondary.main}
            strokeWidth={strokeWidth}
            isAnimationActive={true}
            name="Net Worth"
          />

          <Line
            type="monotone"
            dataKey="marketHigh"
            stroke={theme.palette.success.main}
            strokeWidth={strokeWidth}
            isAnimationActive={true}
            name="Market High"
          />

          <Line
            type="monotone"
            dataKey="balance"
            stroke={theme.palette.primary.main}
            strokeWidth={strokeWidth}
            isAnimationActive={true}
            name="Market Value"
          />

          <Line
            type="monotone"
            dataKey="marketLow"
            stroke={theme.palette.error.main}
            strokeWidth={strokeWidth}
            isAnimationActive={true}
            name="Market Low"
          />
        </LineChart>
      </Stack>
    </Stack>
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
