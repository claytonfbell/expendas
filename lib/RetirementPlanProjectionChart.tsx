import { Stack, Typography, useTheme } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import moment from "moment"
import React, { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip as RechartTooltip,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  useFetchRetirementPlanReport,
  useFetchRetirementPlanUsers,
} from "./api/api"
import { formatMoney } from "./formatMoney"
import {
  RetirementPlanProjectionChartTimeRangeSelect,
  RetirementPlanProjectionRange,
} from "./RetirementPlanProjectionChartTimeRangeSelect"
import { RetirementPlanSection } from "./RetirementPlanSection"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanProjectionChart({ retirementPlan }: Props) {
  const { data: report } = useFetchRetirementPlanReport(retirementPlan.id)

  const { data: users } = useFetchRetirementPlanUsers(retirementPlan.id)

  const fiDate = moment(report?.fiDate?.date)

  const buildAgesString = (date: string) => {
    return users
      ? users
          .map((user) =>
            moment(`${date} 00:00:00`).diff(
              moment(`${user.user.dateOfBirth} 00:00:00`),
              "years"
            )
          )
          .join(" / ")
      : ""
  }

  const [range, setRange] = React.useState<RetirementPlanProjectionRange>("30Y")
  const chartData = useMemo(() => {
    if (!report) return []
    return report.projectionRows
      .filter((row) => {
        const rowYear = moment(`${row.date} 00:00:00`).year()
        const currentYear = moment().year()
        if (range === "10Y") {
          return rowYear <= currentYear + 10
        } else if (range === "20Y") {
          return rowYear <= currentYear + 20
        } else if (range === "30Y") {
          return rowYear <= currentYear + 30
        }
        return true
      })
      .map((row) => ({
        name: moment(`${row.date} 00:00:00`).year(),
        endingBalance: row.endingBalance,
        taxableBalance: row.accounts
          .filter((x) => x.accountBucket === "After_Tax")
          .reduce((sum, account) => sum + account.endingBalance, 0),
        taxDeferredBalance: row.accounts
          .filter((x) => x.accountBucket === "Traditional")
          .reduce((sum, account) => sum + account.endingBalance, 0),
        taxFreeBalance: row.accounts
          .filter((x) => x.accountBucket === "Roth_And_HSA")
          .reduce((sum, account) => sum + account.endingBalance, 0),
      }))
  }, [report, range])

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  const theme = useTheme()

  return (
    <>
      <RetirementPlanSection
        collapsible
        defaultExpanded
        title="Chart"
        summary={<Typography>Projected balance over time</Typography>}
      >
        <Stack spacing={2} alignItems="center">
          <RetirementPlanProjectionChartTimeRangeSelect
            value={range}
            onChange={setRange}
          />
          <BarChart
            style={{
              width: "100%",
              maxHeight: "60vh",
              aspectRatio: 1.618,
            }}
            responsive
            data={chartData}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" niceTicks="snap125" />
            <YAxis
              width="auto"
              niceTicks="snap125"
              tickFormatter={(value) => formatMoney(value, true)}
            />
            <RechartTooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
              }}
              labelFormatter={(value, payload) => (
                <Stack spacing={1}>
                  <Stack sx={{ fontWeight: "bold", fontSize: "1.4rem" }}>
                    {value}
                  </Stack>
                  <Stack>Ages: {buildAgesString(value)}</Stack>
                  <Stack>
                    Total:{" "}
                    {formatMoney(payload[0]?.payload.endingBalance, true)}
                  </Stack>
                </Stack>
              )}
              formatter={(value, name, props) => [
                formatMoney(value as number, true), // Formatted value
                capitalize(
                  name
                    ? name === "startingBalance"
                      ? "Starting Balance"
                      : (name as string)
                    : ""
                ),
              ]}
            />
            <Legend />
            <Bar
              dataKey="taxableBalance"
              stackId="a"
              fill={theme.palette.primary.light}
              name="Taxable"
              isAnimationActive={false}
            />
            <Bar
              dataKey="taxDeferredBalance"
              stackId="a"
              fill={theme.palette.warning.light}
              name="Tax-Deferred"
              isAnimationActive={false}
            />
            <Bar
              dataKey="taxFreeBalance"
              stackId="a"
              fill={theme.palette.success.light}
              name="Tax-Free"
              isAnimationActive={false}
            />

            <ReferenceLine
              x={fiDate.year()}
              stroke={theme.palette.primary.light}
              strokeWidth={4}
              strokeDasharray="5 5"
              label={{
                value: "Retirement Begins",
                position: "top",
                fill: theme.palette.primary.light,
                fontWeight: "bold",
              }}
            />
          </BarChart>
        </Stack>
      </RetirementPlanSection>
    </>
  )
}
