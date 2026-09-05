import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
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
import { SelectBase } from "material-ui-pack"
import { useState } from "react"
import type {
  FileUpload,
  TaxRecordCreateRequest,
  TaxRecordWithIncludes,
} from "../app/api/organizations.$id.taxRecords"
import { useAddTaxRecord } from "./api/hooks/useAddTaxRecord"
import { useGlobalState } from "./GlobalStateProvider"
import DisplayError from "./DisplayError"
import { SelectFile } from "./SelectFile"

const defaultState: TaxRecordCreateRequest = {
  taxYear: "",
  userId: null,
  notes: null,
  files: [],
}

interface Props {
  onComplete?: (taxRecord: TaxRecordWithIncludes) => void
}

export function TaxRecordCreateDialog({ onComplete }: Props) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<TaxRecordCreateRequest>(defaultState)

  const { organization } = useGlobalState()
  const orgUsers = organization?.users ?? []

  function handleUpdate(data: Partial<TaxRecordCreateRequest>) {
    setState((prev) => ({ ...prev, ...data }))
  }

  function addFile(file: FileUpload) {
    setState((prev) => ({ ...prev, files: [...prev.files, file] }))
  }

  function removeFile(index: number) {
    setState((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
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
              <TextField
                size="small"
                label="Tax Year"
                value={state.taxYear}
                onChange={(e) => handleUpdate({ taxYear: e.target.value })}
              />
              <TextField
                size="small"
                label="Notes"
                value={state.notes ?? ""}
                multiline
                minRows={3}
                onChange={(e) => handleUpdate({ notes: e.target.value })}
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

              {state.files.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  {state.files.map((file, index) => (
                    <Chip
                      key={index}
                      color="primary"
                      label={file.fileName}
                      variant="outlined"
                      onDelete={() => removeFile(index)}
                      deleteIcon={<CloseIcon />}
                    />
                  ))}
                </Stack>
              )}

              <SelectFile
                label="Add a file"
                onSelect={(fileInfo) =>
                  addFile({
                    fileBase64: fileInfo.base64,
                    fileContentType: fileInfo.type,
                    fileName: fileInfo.name,
                  })
                }
              />

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
                <Button
                  variant="contained"
                  type="submit"
                  disabled={state.files.length === 0}
                >
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