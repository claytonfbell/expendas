import CloudDownloadIcon from "@mui/icons-material/CloudDownload"
import DeleteIcon from "@mui/icons-material/Delete"
import DownloadIcon from "@mui/icons-material/Download"
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import dayjs from "dayjs"
import { useState } from "react"
import { useGlobalState } from "./GlobalStateContext"
import { useCreateBackup } from "./api/hooks/useCreateBackup"
import { useDeleteBackup } from "./api/hooks/useDeleteBackup"
import { useFetchBackups } from "./api/hooks/useFetchBackups"
import rest from "./api/rest"
import ConfirmDialog from "./ConfirmDialog"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function userDisplayName(user: {
  firstName: string | null
  lastName: string | null
  email: string
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ")
  return name || user.email
}

export function DataBackupManage() {
  const { organizationId } = useGlobalState()
  const { data: backups } = useFetchBackups()
  const { mutateAsync: createBackup, isPending } = useCreateBackup()
  const { mutateAsync: deleteBackup } = useDeleteBackup()

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleCreate = async () => {
    await createBackup()
  }

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteBackup(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          variant="contained"
          startIcon={<CloudDownloadIcon />}
          onClick={handleCreate}
          disabled={isPending}
        >
          {isPending ? "Generating Backup..." : "Generate New Backup"}
        </Button>
      </Box>

      <Alert severity="info">
        Backups include all organization data as CSV files plus all uploaded
        files (receipts, tax records, insurance policies). Only the 10 most
        recent backups are kept in storage; older backups are marked as
        deleted but their records remain for history.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {backups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No backups yet. Click "Generate New Backup" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              backups.map((backup) => {
                if (!backup) return null
                const deleted = backup.cloudFile.deleted
                return (
                  <TableRow key={backup.id}>
                    <TableCell>
                      {dayjs(backup.createdAt).format("MMM D, YYYY h:mm A")}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(backup.cloudFile.size)}
                    </TableCell>
                    <TableCell>
                      {userDisplayName(backup.createdBy)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {deleted ? (
                          <Chip
                            label="Deleted"
                            color="default"
                            size="small"
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            component="a"
                            href={`${rest.baseURL}/organizations/${organizationId}/backups/${backup.id}/download`}
                          >
                            Download
                          </Button>
                        )}
                        {!deleted && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteId(backup.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteId !== null}
        message="Delete Backup?"
        details="This will permanently delete the backup file from storage. The backup record will remain in the list marked as deleted."
        yesLabel="Delete"
        onClose={() => setDeleteId(null)}
        onAccept={handleDelete}
      />
    </Stack>
  )
}