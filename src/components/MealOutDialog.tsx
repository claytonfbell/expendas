import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import type { MealsOut, MealsOutReason } from "@prisma/client"
import dayjs from "dayjs"
import { CurrencyFieldBase, DatePickerBase, SelectBase } from "material-ui-pack"
import { useEffect, useMemo, useState } from "react"
import { useAddMealOut } from "./api/hooks/useAddMealOut"
import { useFetchMealsOut } from "./api/hooks/useFetchMealsOut"
import { useRemoveMealOut } from "./api/hooks/useRemoveMealOut"
import { useUpdateMealOut } from "./api/hooks/useUpdateMealOut"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"

export const reasonOptions: MealsOutReason[] = [
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

export function displayReason(reason: MealsOutReason): string {
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
    case "Away_from_Home":
      return "Away from Home"
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

export function getColorForMealReason(reason: MealsOutReason): string {
  switch (reason) {
    case "Date_Night":
      return "#e91e63"
    case "Friends":
      return "#009688"
    case "Lazy":
      return "#9e9e9e"
    case "No_Groceries":
      return "#ff9800"
    case "Celebration":
      return "#fdd835"
    case "Family":
      return "#4caf50"
    case "Travel":
      return "#3f51b5"
    case "Away_from_Home":
      return "#2196f3"
    case "Out_and_About":
      return "#00bcd4"
    case "Stress":
      return "#f44336"
    case "Other":
      return "#795548"
    default:
      return "#757575"
  }
}

export interface MealOutFormData {
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

export function MealOutDialog({
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
              size="small"
              label="Date"
              value={form.date || null}
              required
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  date: value ?? "",
                }))
              }
            />
            <CurrencyFieldBase
              size="small"
              label="Amount"
              inPennies
              autoDecimal={false}
              value={form.amount}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  amount: value ?? 0,
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