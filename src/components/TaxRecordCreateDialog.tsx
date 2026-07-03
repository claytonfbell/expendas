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
import { TaxRecordType } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import { useState } from "react"
import type {
  TaxRecordCreateRequest,
  TaxRecordWithIncludes,
} from "../app/api/organizations.$id.taxRecords"
import { useAddTaxRecord } from "./api/hooks/useAddTaxRecord"
import { useGlobalState } from "./GlobalStateProvider"
import DisplayError from "./DisplayError"
import {
  displayTaxRecordType,
  taxRecordTypes,
} from "./taxRecordTypes"
import { SelectFile } from "./SelectFile"

const defaultState: TaxRecordCreateRequest = {
  fileName: null,
  fileContentType: null,
  fileBase64: null,
  taxYear: "",
  taxRecordType: "Federal",
  userId: null,
  notes: null,
}

interface Props {
  onComplete?: (taxRecord: TaxRecordWithIncludes) => void
}

export function TaxRecordCreateDialog({ onComplete }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] =
    useState<TaxRecordCreateRequest>(defaultState)

  const { organization } = useGlobalState()
  const orgUsers = organization?.users ?? []

  function handleUpdate(data: Partial<TaxRecordCreateRequest>) {
    setState((prev) => ({ ...prev, ...data }))
  }

  const { mutateAsync: addTaxRecord, error } = useAddTaxRecord()

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
        <DialogTitle>Add Tax Record</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addTaxRecord(state).then((taxRecord) => {
                setState(defaultState)
                setOpen(false)
                if (onComplete) {
                  onComplete(taxRecord)
                }
              })
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
                value={state.taxRecordType}
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
                value={state.taxYear}
                onChange={(e) =>
                  handleUpdate({ taxYear: e.target.value })
                }
              />
              <TextField
                size="small"
                label="Notes"
                value={state.notes}
                multiline
                minRows={3}
                onChange={(e) =>
                  handleUpdate({ notes: e.target.value })
                }
              />
              <SelectBase
                allowNull
                label="User"
                value={state.userId}
                size="small"
                onChange={(userId) =>
                  handleUpdate({ userId: userId as number })
                }
                options={orgUsers.map(({ user }) => ({
                  label: `${user.firstName} ${user.lastName}`,
                  value: user.id,
                }))}
              />
              {state.fileBase64 ? (
                <Stack
                  sx={{
                    alignItems: "start",
                  }}
                >
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
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  justifyContent: "flex-end",
                }}
              >
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