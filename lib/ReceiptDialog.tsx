import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { ReceiptType } from "@prisma/client"
import { CurrencyFieldBase, DatePickerBase, SelectBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { ReceiptWithIncludes } from "../pages/api/organizations/[id]/receipts"
import { displayAccountType } from "./accountTypes"
import { useFetchAccounts, useRemoveReceipt, useUpdateReceipt } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { displayReceiptType, receiptTypes } from "./receiptTypes"

interface Props {
  receipt: ReceiptWithIncludes | null
  onClose: () => void
  onComplete?: (receipt: ReceiptWithIncludes) => void
}

export function ReceiptDialog({ receipt, onClose, onComplete }: Props) {
  const [state, setState] = useState<ReceiptWithIncludes | null>(receipt)
  useEffect(() => {
    setState(receipt)
  }, [receipt])

  function handleUpdate(data: Partial<ReceiptWithIncludes>) {
    setState((prev) => {
      if (!prev) return prev
      return { ...prev, ...data }
    })
  }

  const { data: accounts } = useFetchAccounts()

  const { mutateAsync: updateReceipt, error } = useUpdateReceipt()

  const open = Boolean(receipt)

  const { mutateAsync: removeReceipt } = useRemoveReceipt()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
        <DialogTitle>Update Receipt</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (state) {
                updateReceipt(state).then((receipt) => {
                  setState(null)
                  onClose()
                  if (onComplete) {
                    onComplete(receipt)
                  }
                })
              }
            }}
          >
            <Stack marginTop={2} spacing={2}>
              <DisplayError error={error} />
              <TextField
                size="small"
                label="Merchant"
                value={state?.merchant ?? ""}
                onChange={(e) => handleUpdate({ merchant: e.target.value })}
              />
              <CurrencyFieldBase
                size="small"
                label="Amount"
                currency="USD"
                value={state?.amount ? state.amount / 100 : 0}
                onChange={(amount) =>
                  handleUpdate({ amount: Math.round(amount * 100) })
                }
              />
              <SelectBase
                allowNull
                label="Type"
                value={state?.receiptType ?? ""}
                size="small"
                onChange={(receiptType) =>
                  handleUpdate({ receiptType: receiptType as ReceiptType })
                }
                options={receiptTypes.map((type) => {
                  return { label: displayReceiptType(type), value: type }
                })}
              />
              <DatePickerBase
                size="small"
                label="Date"
                value={state?.date ?? null}
                onChange={(date) => handleUpdate({ date })}
              />
              <DatePickerBase
                size="small"
                label="Date Paid"
                value={state?.datePaid ?? null}
                onChange={(date) => handleUpdate({ datePaid: date })}
              />
              <TextField
                size="small"
                label="Notes"
                value={state?.notes ?? ""}
                multiline
                minRows={3}
                onChange={(e) => handleUpdate({ notes: e.target.value })}
              />
              <SelectBase
                allowNull
                label="Account"
                value={state?.accountId ?? null}
                size="small"
                onChange={(accountId) =>
                  handleUpdate({ accountId: accountId as number })
                }
                options={(accounts ?? []).map(({ id, name, accountType }) => {
                  return {
                    label: `${name} (${displayAccountType(accountType)})`,
                    value: id,
                  }
                })}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setConfirm(true)}
                >
                  Delete
                </Button>
                <Button variant="outlined" onClick={() => onClose()}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Save
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        message="Are you sure you want to delete this receipt? This action cannot be undone."
        onAccept={() => {
          if (!receipt) return
          removeReceipt(receipt.id).then(() => {
            setConfirm(false)
            onClose()
          })
        }}
      />
    </>
  )
}
