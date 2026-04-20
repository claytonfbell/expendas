import AddIcon from "@mui/icons-material/Add"
import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  Stack,
  TextField,
} from "@mui/material"
import { ReceiptType } from "@prisma/client"
import { CurrencyFieldBase, DatePickerBase, SelectBase } from "material-ui-pack"
import { useState } from "react"
import {
  ReceiptCreateRequest,
  ReceiptWithIncludes,
} from "../pages/api/organizations/[id]/receipts"
import { displayAccountType } from "./accountTypes"
import { useAddReceipt, useFetchAccounts } from "./api/api"
import DisplayError from "./DisplayError"
import { displayReceiptType, receiptTypes } from "./receiptTypes"
import { SelectFile } from "./SelectFile"

const defaultState: ReceiptCreateRequest = {
  fileName: null,
  fileContentType: null,
  fileBase64: null,
  merchant: "",
  amount: 0,
  receiptType: "Other",
  date: null,
  datePaid: null,
  accountId: null,
  notes: null,
}

interface Props {
  onComplete?: (receipt: ReceiptWithIncludes) => void
}

export function ReceiptCreateDialog({ onComplete }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<ReceiptCreateRequest>(defaultState)

  function handleUpdate(data: Partial<ReceiptCreateRequest>) {
    setState((prev) => ({ ...prev, ...data }))
  }

  const { data: accounts } = useFetchAccounts()

  const { mutateAsync: addReceipt, error } = useAddReceipt()

  return (
    <>
      <Fab size="small" color="primary" onClick={() => setOpen(true)}>
        <AddIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Receipt</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addReceipt(state).then((receipt) => {
                setState(defaultState)
                setOpen(false)
                if (onComplete) {
                  onComplete(receipt)
                }
              })
            }}
          >
            <Stack marginTop={2} spacing={2}>
              <DisplayError error={error} />
              <TextField
                size="small"
                label="Merchant"
                value={state.merchant}
                onChange={(e) => handleUpdate({ merchant: e.target.value })}
              />
              <CurrencyFieldBase
                size="small"
                label="Amount"
                currency="USD"
                value={state.amount / 100}
                onChange={(amount) =>
                  handleUpdate({ amount: Math.round(amount * 100) })
                }
              />
              <SelectBase
                allowNull
                label="Type"
                value={state.receiptType}
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
                value={state.date}
                onChange={(date) => handleUpdate({ date })}
              />
              <DatePickerBase
                size="small"
                label="Date Paid"
                value={state.datePaid}
                onChange={(date) => handleUpdate({ datePaid: date })}
              />
              <TextField
                size="small"
                label="Notes"
                value={state.notes}
                multiline
                minRows={3}
                onChange={(e) => handleUpdate({ notes: e.target.value })}
              />
              <SelectBase
                allowNull
                label="Account"
                value={state.accountId}
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
              {state.fileBase64 ? (
                <Stack alignItems={"start"}>
                  <Chip
                    color="primary"
                    label={state.fileName}
                    variant="outlined"
                    onDelete={() => {
                      handleUpdate({
                        fileBase64: null,
                        fileName: null,
                        fileContentType: null,
                      })
                    }}
                  />
                </Stack>
              ) : (
                <SelectFile
                  label="Select a file"
                  onSelect={(fileInfo) =>
                    handleUpdate({
                      fileBase64: fileInfo.base64,
                      fileContentType: fileInfo.type,
                      fileName: fileInfo.name,
                    })
                  }
                />
              )}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setOpen(false)}>
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
    </>
  )
}
