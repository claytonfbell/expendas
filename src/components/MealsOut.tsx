import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
  Chip,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import type { MealsOut, MealsOutReason } from "@prisma/client"
import dayjs from "dayjs"
import dayOfYear from "dayjs/plugin/dayOfYear"
import isoWeek from "dayjs/plugin/isoWeek"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { useEffect, useMemo, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useFetchMealsOut } from "./api/hooks/useFetchMealsOut"
import { BottomStatusBar } from "./BottomStatusBar"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"
import {
  displayReason,
  getColorForMealReason,
  MealOutDialog,
} from "./MealOutDialog"
import { StatBox } from "./StatBox"
import { StatBoxContainer } from "./StatBoxContainer"
import {
  ReportRange,
  TrendsReportsTimeRangeSelect,
} from "./TrendsReportsTimeRangeSelect"

dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(dayOfYear)

export function MealsOut() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { data: mealsOut } = useFetchMealsOut()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMealOut, setEditMealOut] = useState<MealsOut | null>(null)

  const [selectedRange, setSelectedRange] = useState<ReportRange>(() => {
    const stored = localStorage.getItem("MealsOut.selectedRange")
    return stored ? (stored as ReportRange) : "YTD"
  })

  useEffect(() => {
    localStorage.setItem("MealsOut.selectedRange", selectedRange)
  }, [selectedRange])

  const now = dayjs()

  const stats = useMemo(() => {
    if (!mealsOut) return null
    const periods = [
      { label: "7 days", days: 7 },
      { label: "30 days", days: 30 },
      { label: "90 days", days: 90 },
    ]
    return periods.map(({ label, days }) => {
      const cutoff = now.subtract(days, "day").format("YYYY-MM-DD")
      const filtered = mealsOut.filter((m) => m.date >= cutoff)
      return {
        label,
        count: filtered.length,
        total: filtered.reduce((sum, m) => sum + m.amount, 0),
      }
    })
  }, [mealsOut, now])

  const filteredMeals = useMemo(() => {
    if (!mealsOut) return []
    if (selectedRange === "ALL") return mealsOut

    let cutoff: dayjs.Dayjs
    switch (selectedRange) {
      case "1W":
        cutoff = now.subtract(7, "day")
        break
      case "1M":
        cutoff = now.subtract(1, "month")
        break
      case "3M":
        cutoff = now.subtract(3, "month")
        break
      case "6M":
        cutoff = now.subtract(6, "month")
        break
      case "YTD":
        cutoff = now.startOf("year")
        break
      case "1Y":
        cutoff = now.subtract(1, "year")
        break
      case "2Y":
        cutoff = now.subtract(2, "year")
        break
      default:
        cutoff = now.subtract(30, "day")
    }
    const cutoffStr = cutoff.format("YYYY-MM-DD")
    return mealsOut.filter((m) => m.date >= cutoffStr)
  }, [mealsOut, selectedRange, now])

  const reasonStats = useMemo(() => {
    if (!filteredMeals.length) return null
    const byReason = new Map<MealsOutReason, { count: number; total: number }>()
    filteredMeals.forEach((m) => {
      const existing = byReason.get(m.reason) || { count: 0, total: 0 }
      existing.count++
      existing.total += m.amount
      byReason.set(m.reason, existing)
    })
    return Array.from(byReason.entries())
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 4)
      .map(([reason, data]) => ({
        reason,
        total: data.total,
        count: data.count,
      }))
  }, [filteredMeals])

  const chartData = useMemo(() => {
    if (!filteredMeals.length) return []
    const sorted = [...filteredMeals].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    const byWeek = new Map<string, number>()
    sorted.forEach((m) => {
      const d = dayjs(m.date)
      const year = d.isoWeekYear()
      const week = d.isoWeek()
      const key = `${year}-W${String(week).padStart(2, "0")}`
      byWeek.set(key, (byWeek.get(key) || 0) + m.amount)
    })
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, total]) => ({
        week,
        total: total / 100,
      }))
  }, [filteredMeals])

  const handleEdit = (mealOut: MealsOut) => {
    setEditMealOut(mealOut)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditMealOut(null)
    setDialogOpen(true)
  }

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h1">Meals Out</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Meal Out
          </Button>
        </Stack>

        {stats && (
          <StatBoxContainer>
            {stats.map((stat) => (
              <StatBox
                key={stat.label}
                title={stat.label}
                value={stat.count}
                subtitle={formatMoney(stat.total)}
              />
            ))}
          </StatBoxContainer>
        )}

        {reasonStats && reasonStats.length > 0 && (
          <Stack spacing={1}>
            <Typography variant="h6" color="text.secondary">
              Top Reasons ({selectedRange})
            </Typography>
            <StatBoxContainer>
              {reasonStats.map((rs) => (
                <StatBox
                  key={rs.reason}
                  title={displayReason(rs.reason)}
                  titleColor={getColorForMealReason(rs.reason)}
                  value={rs.count}
                  subtitle={formatMoney(rs.total)}
                />
              ))}
            </StatBoxContainer>
          </Stack>
        )}

        {chartData.length > 0 && (
          <>
            <Stack
              sx={{
                alignItems: "center",
              }}
            >
              <TrendsReportsTimeRangeSelect
                value={selectedRange}
                onChange={setSelectedRange}
              />
            </Stack>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [
                    formatMoney(Number(value) * 100),
                    "Amount Spent",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1976d2"
                  name="Amount Spent"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Date
              </TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Reason
              </TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                Notes
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mealsOut?.map((mealOut) => (
              <TableRow key={mealOut.id}>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {dayjs(mealOut.date).format("ddd ll")}
                </TableCell>
                <TableCell>
                  <Stack spacing={1}>
                    <Typography variant="body2">{mealOut.merchant}</Typography>
                    {isMobile && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: "center" }}
                      >
                        <Stack>{dayjs(mealOut.date).format("M/D/YYYY")}</Stack>
                        <Chip
                          label={displayReason(mealOut.reason)}
                          size="small"
                          sx={{
                            color: getColorForMealReason(mealOut.reason),
                            borderColor: getColorForMealReason(mealOut.reason),
                            alignSelf: "flex-start",
                            mt: 0.5,
                          }}
                          variant="outlined"
                        />
                      </Stack>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{formatMoney(mealOut.amount)}</TableCell>
                <TableCell
                  sx={{
                    display: { xs: "none", md: "table-cell" },
                    color: getColorForMealReason(mealOut.reason),
                    fontWeight: "bold",
                  }}
                >
                  {displayReason(mealOut.reason)}
                </TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                  {mealOut.notes ?? ""}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(mealOut)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ExpendasTable>
      </Stack>

      <MealOutDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditMealOut(null)
        }}
        mealOut={editMealOut}
      />

      <BottomStatusBar />
    </>
  )
}
