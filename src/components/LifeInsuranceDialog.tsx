import DeleteIcon from "@mui/icons-material/Delete"
import DownloadIcon from "@mui/icons-material/Download"
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import { CurrencyFieldBase, DatePickerBase, SelectBase } from "material-ui-pack"
import mime from "mime-types"
import prettyBytes from "pretty-bytes"
import { useEffect, useMemo, useState } from "react"
import type { InsurancePolicyWithIncludes } from "../app/api/organizations.$id.insurancePolicies"
import { useAddInsurancePolicy } from "./api/hooks/useAddInsurancePolicy"
import { useAddInsurancePolicyFile } from "./api/hooks/useAddInsurancePolicyFile"
import { useFetchInsurancePolicies } from "./api/hooks/useFetchInsurancePolicies"
import { useRemoveInsurancePolicy } from "./api/hooks/useRemoveInsurancePolicy"
import { useRemoveInsurancePolicyFile } from "./api/hooks/useRemoveInsurancePolicyFile"
import { useUpdateInsurancePolicy } from "./api/hooks/useUpdateInsurancePolicy"
import rest from "./api/rest"
import ConfirmDialog from "./ConfirmDialog"
import dayjs from "./dayjs"
import DisplayError from "./DisplayError"
import { SelectFile } from "./SelectFile"
import { useGlobalState } from "./GlobalStateContext"

const insuranceTypeSuggestions = [
  "Term Life",
  "Voluntary Life",
  "AD&D",
  "Term Life & AD&D",
  "Whole Life",
  "Universal Life",
  "Group Life",
]

interface LifeInsuranceFormData {
  company: string
  policyNumber: string
  type: string
  termYears: number | null
  termEnd: string | null
  amount: number
  premium: number | null
  notes: string
  userId: number | null
}

const emptyFormData: LifeInsuranceFormData = {
  company: "",
  policyNumber: "",
  type: "",
  termYears: null,
  termEnd: null,
  amount: 0,
  premium: null,
  notes: "",
  userId: null,
}

function displayFileType(contentType: string): string {
  const ext = mime.extension(contentType)
  return ext ? ext.toUpperCase() : contentType
}

export function LifeInsuranceDialog({
  open,
  onClose,
  policy,
}: {
  open: boolean
  onClose: () => void
  policy: InsurancePolicyWithIncludes | null
}) {
  const isEditing = policy !== null
  const [form, setForm] = useState<LifeInsuranceFormData>(emptyFormData)
  const [confirm, setConfirm] = useState(false)
  const { data: policies } = useFetchInsurancePolicies()
  const { organization, organizationId } = useGlobalState()
  const orgUsers = organization?.users ?? []

  const { mutateAsync: addInsurancePolicy, error: addError } =
    useAddInsurancePolicy()
  const { mutateAsync: updateInsurancePolicy, error: updateError } =
    useUpdateInsurancePolicy()
  const { mutateAsync: removeInsurancePolicy } = useRemoveInsurancePolicy()
  const { mutateAsync: addInsurancePolicyFile } = useAddInsurancePolicyFile()
  const { mutateAsync: removeInsurancePolicyFile } =
    useRemoveInsurancePolicyFile()

  const [fileState, setFileState] = useState<
    InsurancePolicyWithIncludes["insurancePolicyFiles"]
  >([])

  const error = isEditing ? updateError : addError

  useEffect(() => {
    if (open) {
      if (policy) {
        setForm({
          company: policy.company,
          policyNumber: policy.policyNumber,
          type: policy.type,
          termYears: policy.termYears,
          termEnd: policy.termEnd,
          amount: policy.amount,
          premium: policy.premium,
          notes: policy.notes ?? "",
          userId: policy.userId,
        })
        setFileState(policy.insurancePolicyFiles)
      } else {
        setForm(emptyFormData)
        setFileState([])
      }
    }
  }, [open, policy])

  const previousCompanies = useMemo(() => {
    if (!policies) return []
    const companies = new Set(policies.map((p) => p.company))
    return Array.from(companies).sort()
  }, [policies])

  const handleSubmit = async () => {
    if (isEditing && policy) {
      await updateInsurancePolicy({
        id: policy.id,
        organizationId: policy.organizationId,
        userId: form.userId!,
        company: form.company,
        policyNumber: form.policyNumber,
        type: form.type,
        termYears: form.termYears,
        termEnd: form.termEnd,
        amount: form.amount,
        premium: form.premium,
        notes: form.notes || null,
      })
    } else {
      await addInsurancePolicy({
        userId: form.userId!,
        company: form.company,
        policyNumber: form.policyNumber,
        type: form.type,
        termYears: form.termYears,
        termEnd: form.termEnd,
        amount: form.amount,
        premium: form.premium,
        notes: form.notes || null,
      })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (policy) {
      await removeInsurancePolicy(policy.id)
      onClose()
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? "Edit Insurance Policy" : "Add Insurance Policy"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ marginTop: 2 }}>
            <DisplayError error={error} />

            <SelectBase
              label="Policyholder"
              value={form.userId}
              size="small"
              onChange={(userId) =>
                setForm((prev) => ({
                  ...prev,
                  userId: userId as number | null,
                }))
              }
              options={orgUsers.map(({ user }) => ({
                label: `${user.firstName} ${user.lastName}`,
                value: user.id,
              }))}
            />

            <Autocomplete
              freeSolo
              options={previousCompanies}
              value={form.company}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  company: value ?? "",
                }))
              }
              onInputChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  company: value,
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Insurance Company"
                  size="small"
                  required
                />
              )}
            />

            <Autocomplete
              freeSolo
              options={insuranceTypeSuggestions}
              value={form.type}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  type: value ?? "",
                }))
              }
              onInputChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  type: value,
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type"
                  size="small"
                  required
                />
              )}
            />

            <TextField
              size="small"
              label="Policy Number"
              value={form.policyNumber}
              required
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  policyNumber: e.target.value,
                }))
              }
            />

            <CurrencyFieldBase
              size="small"
              label="Coverage Amount"
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

            <CurrencyFieldBase
              size="small"
              label="Premium (optional)"
              inPennies
              autoDecimal={false}
              value={form.premium ?? 0}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  premium: value ?? null,
                }))
              }
            />

            <TextField
              size="small"
              label="Term Years (optional)"
              type="number"
              value={form.termYears ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  termYears:
                    e.target.value === "" ? null : Number(e.target.value),
                }))
              }
            />

            <DatePickerBase
              size="small"
              label="Term End (optional)"
              value={form.termEnd}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  termEnd: value ?? null,
                }))
              }
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

            {isEditing && (
              <>
                <Typography variant="h6">Policy Files</Typography>

                {fileState.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {fileState.map((file) => (
                      <Card key={file.id} variant="outlined">
                        <CardContent>
                          <Typography variant="body2" noWrap>
                            {file.organizationCloudFile.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {displayFileType(
                              file.organizationCloudFile.cloudFile.contentType
                            )}{" "}
                            &middot;{" "}
                            {prettyBytes(
                              file.organizationCloudFile.cloudFile.size
                            )}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <IconButton
                            size="small"
                            component={Link}
                            href={`${rest.baseURL}/organizations/${organizationId}/insurancePolicies/${policy.id}/files/${file.id}/download`}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              removeInsurancePolicyFile({
                                insurancePolicyId: policy.id,
                                insurancePolicyFileId: file.id,
                              })
                              setFileState((prev) =>
                                prev.filter((f) => f.id !== file.id)
                              )
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </Card>
                    ))}
                  </Box>
                )}

                {fileState.length === 0 && (
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    No files attached.
                  </Typography>
                )}

                <SelectFile
                  label="Add a file"
                  onSelect={(fileInfo) => {
                    addInsurancePolicyFile({
                      insurancePolicyId: policy.id,
                      fileName: fileInfo.name,
                      fileContentType: fileInfo.type,
                      fileBase64: fileInfo.base64,
                    }).then((newFile) => {
                      setFileState((prev) => [...prev, newFile])
                    })
                  }}
                />
              </>
            )}
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
        message="Are you sure you want to delete this insurance policy? This action cannot be undone."
        onAccept={handleDelete}
      />
    </>
  )
}