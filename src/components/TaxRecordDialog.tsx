import DeleteIcon from "@mui/icons-material/Delete"
import DownloadIcon from "@mui/icons-material/Download"
import GridViewIcon from "@mui/icons-material/GridView"
import TableRowsIcon from "@mui/icons-material/TableRows"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { SelectBase } from "material-ui-pack"
import mime from "mime-types"
import prettyBytes from "pretty-bytes"
import { useEffect, useState } from "react"
import type { TaxRecordWithIncludes } from "../app/api/organizations.$id.taxRecords"
import { useAddTaxRecordFile } from "./api/hooks/useAddTaxRecordFile"
import { useRemoveTaxRecord } from "./api/hooks/useRemoveTaxRecord"
import { useRemoveTaxRecordFile } from "./api/hooks/useRemoveTaxRecordFile"
import { useUpdateTaxRecord } from "./api/hooks/useUpdateTaxRecord"
import rest from "./api/rest"
import { useGlobalState } from "./GlobalStateProvider"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { SelectFile } from "./SelectFile"

interface Props {
  taxRecord: TaxRecordWithIncludes | null
  onClose: () => void
  onComplete?: (taxRecord: TaxRecordWithIncludes) => void
}

function displayFileType(contentType: string): string {
  const ext = mime.extension(contentType)
  return ext ? ext.toUpperCase() : contentType
}

export function TaxRecordDialog({ taxRecord, onClose, onComplete }: Props) {
  const [state, setState] = useState<TaxRecordWithIncludes | null>(taxRecord)
  useEffect(() => {
    setState(taxRecord)
  }, [taxRecord])

  const { organization, organizationId } = useGlobalState()
  const orgUsers = organization?.users ?? []

  function handleUpdate(data: Partial<TaxRecordWithIncludes>) {
    setState((prev) => {
      if (!prev) return prev
      return { ...prev, ...data }
    })
  }

  const { mutateAsync: updateTaxRecord, error } = useUpdateTaxRecord()
  const { mutateAsync: addTaxRecordFile } = useAddTaxRecordFile()
  const { mutateAsync: removeTaxRecordFile } = useRemoveTaxRecordFile()

  const open = Boolean(taxRecord)

  const { mutateAsync: removeTaxRecord } = useRemoveTaxRecord()
  const [confirm, setConfirm] = useState(false)

  const [viewMode, setViewMode] = useState<"table" | "tile">("table")

  return (
    <>
      <Dialog open={open} onClose={() => onClose()} maxWidth="md" fullWidth>
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
              <TextField
                size="small"
                label="Tax Year"
                value={state?.taxYear ?? ""}
                onChange={(e) => handleUpdate({ taxYear: e.target.value })}
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
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Files</Typography>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={viewMode}
                  onChange={(_, v) => {
                    if (v) setViewMode(v)
                  }}
                >
                  <ToggleButton value="table">
                    <TableRowsIcon />
                  </ToggleButton>
                  <ToggleButton value="tile">
                    <GridViewIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {state && state.taxRecordFiles.length === 0 && (
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  No files attached.
                </Typography>
              )}

              {state && viewMode === "table" && state.taxRecordFiles.length > 0 && (
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      borderCollapse: "collapse",
                      "& td, & th": {
                        padding: "8px",
                        borderBottom: 1,
                        borderColor: "divider",
                        fontSize: 14,
                      },
                      "& th": {
                        textAlign: "left",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>Filename</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.taxRecordFiles.map((taxRecordFile) => (
                        <tr key={taxRecordFile.id}>
                          <td>
                            {taxRecordFile.organizationCloudFile.name}
                          </td>
                          <td>
                            {displayFileType(
                              taxRecordFile.organizationCloudFile.cloudFile
                                .contentType
                            )}
                          </td>
                          <td>
                            {prettyBytes(
                              taxRecordFile.organizationCloudFile.cloudFile
                                .size
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <IconButton
                              size="small"
                              component={Link}
                              href={`${rest.baseURL}/organizations/${organizationId}/taxRecords/${state.id}/files/${taxRecordFile.id}/download`}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                removeTaxRecordFile({
                                  taxRecordId: state.id,
                                  taxRecordFileId: taxRecordFile.id,
                                })
                                setState((prev) => {
                                  if (!prev) return prev
                                  return {
                                    ...prev,
                                    taxRecordFiles:
                                      prev.taxRecordFiles.filter(
                                        (f) => f.id !== taxRecordFile.id
                                      ),
                                  }
                                })
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              )}

              {state && viewMode === "tile" && state.taxRecordFiles.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 2,
                  }}
                >
                  {state.taxRecordFiles.map((taxRecordFile) => (
                    <Card key={taxRecordFile.id} variant="outlined">
                      <CardContent>
                        <Typography variant="body2" noWrap>
                          {taxRecordFile.organizationCloudFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {displayFileType(
                            taxRecordFile.organizationCloudFile.cloudFile
                              .contentType
                          )}{" "}
                          &middot;{" "}
                          {prettyBytes(
                            taxRecordFile.organizationCloudFile.cloudFile.size
                          )}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          size="small"
                          component={Link}
                          href={`${rest.baseURL}/organizations/${organizationId}/taxRecords/${state.id}/files/${taxRecordFile.id}/download`}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            removeTaxRecordFile({
                              taxRecordId: state.id,
                              taxRecordFileId: taxRecordFile.id,
                            })
                            setState((prev) => {
                              if (!prev) return prev
                              return {
                                ...prev,
                                taxRecordFiles: prev.taxRecordFiles.filter(
                                  (f) => f.id !== taxRecordFile.id
                                ),
                              }
                            })
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}

              {state && (
                <SelectFile
                  label="Add a file"
                  onSelect={(fileInfo) => {
                    addTaxRecordFile({
                      taxRecordId: state.id,
                      fileName: fileInfo.name,
                      fileContentType: fileInfo.type,
                      fileBase64: fileInfo.base64,
                    }).then((newFile) => {
                      setState((prev) => {
                        if (!prev) return prev
                        return {
                          ...prev,
                          taxRecordFiles: [...prev.taxRecordFiles, newFile],
                        }
                      })
                    })
                  }}
                />
              )}

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