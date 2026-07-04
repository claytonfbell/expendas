import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import type { MealsOut, MealsOutReason } from "@prisma/client"
import dayjs from "dayjs"
import { CurrencyFieldBase, DatePickerBase, SelectBase } from "material-ui-pack"
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
import { useAddMealOut } from "./api/hooks/useAddMealOut"
import { useFetchMealsOut } from "./api/hooks/useFetchMealsOut"
import { useRemoveMealOut } from "./api/hooks/useRemoveMealOut"
import { useUpdateMealOut } from "./api/hooks/useUpdateMealOut"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"

const reasonOptions: MealsOutReason[] = [
  "Date_Night",
  "Friends",
  "Lazy",
  "No_Groceries",
  "Celebration",
  "Family",
  "Travel",
  "Out_and_About",
  "Stress",
  "Other",
]

function displayReason(reason: MealsOutReason): string {
  switch (reason) {
    case "Date_Night":
      return "Date Night"
    case "Friends":
      return "Friends"
    case "Lazy":
      return "Lazy"
    case "No_Groceries":
      return "No Groceries"
    case "Celebration":
      return "Celebration"
    case "Family":
      return "Family"
    case "Travel":
      return "Travel"
    case "Out_and_About":
      return "Out and About"
    case "Stress":
      return "Stress"
    case "Other":
      return "Other"
    default:
      return reason
  }
}

interface MealOutFormData {
  date: string
  amount: number
  merchant: string
  reason: MealsOutReason | ""
  notes: string
}

const emptyFormData: MealOutFormData = {
  date: dayjs().format("YYYY-MM-DD"),
  amount: 0,
  merchant: "",
  reason: "",
  notes: "",
}

function MealOutDialog({
  open,
  onClose,
  mealOut,
}: {
  open: boolean
  onClose: () => void
  mealOut: MealsOut | null
}) {
  const isEditing = mealOut !== null
  const [form, setForm] = useState<MealOutFormData>(emptyFormData)
  const { data: mealsOut } = useFetchMealsOut()
  const { mutateAsync: addMealOut, error: addError } = useAddMealOut()
  const { mutateAsync: updateMealOut, error: updateError } = useUpdateMealOut()
  const { mutateAsync: removeMealOut } = useRemoveMealOut()
  const [confirm, setConfirm] = useState(false)

  const error = isEditing ? updateError : addError

  useEffect(() => {
    if (open) {
      if (mealOut) {
        setForm({
          date: mealOut.date,
          amount: mealOut.amount,
          merchant: mealOut.merchant,
          reason: mealOut.reason,
          notes: mealOut.notes ?? "",
        })
      } else {
        setForm(emptyFormData)
      }
    }
  }, [open, mealOut])

  const previousMerchants = useMemo(() => {
    if (!mealsOut) return []
    const merchants = new Set(mealsOut.map((m) => m.merchant))
    return Array.from(merchants).sort()
  }, [mealsOut])

  const handleSubmit = async () => {
    if (!form.reason) return
    if (isEditing && mealOut) {
      await updateMealOut({
        id: mealOut.id,
        organizationId: mealOut.organizationId,
        date: form.date,
        amount: form.amount,
        merchant: form.merchant,
        reason: form.reason as MealsOutReason,
        notes: form.notes || null,
      })
    } else {
      await addMealOut({
        date: form.date,
        amount: form.amount,
        merchant: form.merchant,
        reason: form.reason as MealsOutReason,
        notes: form.notes || null,
      })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (mealOut) {
      await removeMealOut(mealOut.id)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Meal Out" : "Add Meal Out"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ marginTop: 2 }}>
            <DisplayError error={error} />
            <DatePickerBase
              label="Date"
              value={form.date ? dayjs(form.date).format("YYYY-MM-DD") : null}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  date: value ? value : "",
                }))
              }
            />
            <CurrencyFieldBase
              label="Amount"
              value={form.amount / 100}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  amount: Math.round((value ?? 0) * 100),
                }))
              }
            />
            <Autocomplete
              freeSolo
              options={previousMerchants}
              value={form.merchant}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  merchant: value ?? "",
                }))
              }
              onInputChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  merchant: value,
                }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Merchant" size="small" required />
              )}
            />
            <SelectBase
              label="Reason"
              value={form.reason}
              size="small"
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  reason: (value as MealsOutReason) ?? "",
                }))
              }
              options={reasonOptions.map((reason) => ({
                label: displayReason(reason),
                value: reason,
              }))}
            />
            <TextField
              size="small"
              label="Notes"
              value={form.notes}
              multiline
              minRows={3}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          {isEditing && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirm(true)}
            >
              Delete
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {isEditing ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        message="Are you sure you want to delete this meal out? This action cannot be undone."
        onAccept={handleDelete}
      />
    </>
  )
}

export function MealsOut() {
  const { data: mealsOut } = useFetchMealsOut()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMealOut, setEditMealOut] = useState<MealsOut | null>(null)

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

  const chartData = useMemo(() => {
    if (!mealsOut) return []
    const sorted = [...mealsOut].sort((a, b) => a.date.localeCompare(b.date))
    const byMonth = new Map<string, { count: number; total: number }>()
    sorted.forEach((m) => {
      const month = m.date.substring(0, 7)
      const existing = byMonth.get(month) || { count: 0, total: 0 }
      existing.count++
      existing.total += m.amount
      byMonth.set(month, existing)
    })
    return Array.from(byMonth.entries()).map(([month, data]) => ({
      month,
      count: data.count,
      total: data.total / 100,
    }))
  }, [mealsOut])

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
          <Stack direction="row" spacing={2}>
            {stats.map((stat) => (
              <Stack
                key={stat.label}
                sx={{
                  flex: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  padding: 2,
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">{stat.label}</Typography>
                <Typography variant="h4">{stat.count}</Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatMoney(stat.total)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "total")
                    return [
                      formatMoney((value as number) * 100),
                      "Amount Spent",
                    ]
                  return [value, "Count"]
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total"
                stroke="#1976d2"
                name="Amount Spent"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="count"
                stroke="#2e7d32"
                name="Count"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Reason</TableCell>
              <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mealsOut?.map((mealOut) => (
              <TableRow key={mealOut.id}>
                <TableCell>{dayjs(mealOut.date).format("ddd ll")}</TableCell>
                <TableCell>{mealOut.merchant}</TableCell>
                <TableCell>{formatMoney(mealOut.amount)}</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{displayReason(mealOut.reason)}</TableCell>
                <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{mealOut.notes ?? ""}</TableCell>
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
    </>
  )
}
