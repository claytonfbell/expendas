import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { TaxRecordType } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import type { TaxRecordWithIncludes } from "../app/api/organizations.$id.taxRecords"
import { useRemoveTaxRecord } from "./api/hooks/useRemoveTaxRecord"
import { useUpdateTaxRecord } from "./api/hooks/useUpdateTaxRecord"
import { useGlobalState } from "./GlobalStateProvider"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import {
  displayTaxRecordType,
  taxRecordTypes,
} from "./taxRecordTypes"

interface Props {
  taxRecord: TaxRecordWithIncludes | null
  onClose: () => void
  onComplete?: (taxRecord: TaxRecordWithIncludes) => void
}

export function TaxRecordDialog({
  taxRecord,
  onClose,
  onComplete,
}: Props) {
  const [state, setState] =
    useState<TaxRecordWithIncludes | null>(taxRecord)
  useEffect(() => {
    setState(taxRecord)
  }, [taxRecord])

  const { organization } = useGlobalState()
  const orgUsers = organization?.users ?? []

  function handleUpdate(data: Partial<TaxRecordWithIncludes>) {
    setState((prev) => {
      if (!prev) return prev
      return { ...prev, ...data }
    })
  }

  const { mutateAsync: updateTaxRecord, error } = useUpdateTaxRecord()

  const open = Boolean(taxRecord)

  const { mutateAsync: removeTaxRecord } = useRemoveTaxRecord()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
        <DialogTitle>Update Tax Record</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (state) {
                updateTaxRecord(state).then((taxRecord) => {
                  setState(null)
                  onClose()
                  if (onComplete) {
                    onComplete(taxRecord)
                  }
                })
              }
            }}
          >
            <Stack
              spacing={2}
              sx={{
                marginTop: 2,
              }}
            >
              <DisplayError error={error} />
              <SelectBase
                allowNull
                label="Type"
                value={state?.taxRecordType ?? ""}
                size="small"
                onChange={(taxRecordType) =>
                  handleUpdate({
                    taxRecordType: taxRecordType as TaxRecordType,
                  })
                }
                options={taxRecordTypes.map((type) => {
                  return {
                    label: displayTaxRecordType(type),
                    value: type,
                  }
                })}
              />
              <TextField
                size="small"
                label="Tax Year"
                value={state?.taxYear ?? ""}
                onChange={(e) =>
                  handleUpdate({ taxYear: e.target.value })
                }
              />
              <TextField
                size="small"
                label="Notes"
                value={state?.notes ?? ""}
                multiline
                minRows={3}
                onChange={(e) =>
                  handleUpdate({ notes: e.target.value })
                }
              />
              <SelectBase
                allowNull
                label="User"
                value={state?.userId ?? null}
                size="small"
                onChange={(userId) =>
                  handleUpdate({ userId: userId as number })
                }
                options={orgUsers.map(({ user }) => ({
                  label: `${user.firstName} ${user.lastName}`,
                  value: user.id,
                }))}
              />
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "flex-end",
                }}
              >
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
        message="Are you sure you want to delete this tax record? This action cannot be undone."
        onAccept={() => {
          if (!taxRecord) return
          removeTaxRecord(taxRecord.id).then(() => {
            setConfirm(false)
            onClose()
          })
        }}
      />
    </>
  )
}