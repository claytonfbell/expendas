import CloudIcon from "@mui/icons-material/Cloud"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { useCheckLogin } from "./api/hooks/useCheckLogin"
import { usePruneS3 } from "./api/hooks/usePruneS3"
import type { PruneS3Result } from "./api/hooks/usePruneS3"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import type { RestError } from "./api/rest"

const ALLOWED_EMAIL = "claytonfbell@gmail.com"

export function CloudFilesManage() {
  const { data: login } = useCheckLogin()
  const { mutateAsync: prune, isPending } = usePruneS3()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState<RestError | null>(null)
  const [result, setResult] = useState<PruneS3Result | null>(null)

  const isAuthorized = login?.user.email === ALLOWED_EMAIL

  const handleConfirm = async () => {
    setConfirmOpen(false)
    setError(null)
    try {
      const res = await prune()
      setResult(res)
    } catch (e) {
      setError(e as RestError)
    }
  }

  if (!isAuthorized) {
    return (
      <Alert severity="warning">You are not authorized to access this page.</Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<CloudIcon />}
          onClick={() => setConfirmOpen(true)}
          disabled={isPending}
        >
          {isPending ? "Pruning..." : "Prune S3"}
        </Button>
      </Box>

      <DisplayError error={error} onClose={() => setError(null)} />

      <ConfirmDialog
        open={confirmOpen}
        message="Prune S3 Storage?"
        details="This will permanently delete from S3 all files that have no CloudFile database record or are marked as deleted. This action cannot be undone."
        yesLabel="Prune"
        onClose={() => setConfirmOpen(false)}
        onAccept={handleConfirm}
      />

      <Dialog
        open={result !== null}
        onClose={() => setResult(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>S3 Prune Results</DialogTitle>
        <DialogContent>
          {result && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Scanned: ${result.totalScanned}`} />
                <Chip
                  label={`Deleted: ${result.deletedCount}`}
                  color="error"
                />
                <Chip label={`Kept: ${result.keptCount}`} color="success" />
              </Stack>

              {result.deletedFiles.length === 0 ? (
                <Typography color="text.secondary">
                  No files were pruned. S3 storage is clean.
                </Typography>
              ) : (
                <Box
                  sx={{
                    maxHeight: 400,
                    overflowY: "auto",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  {result.deletedFiles.map((f) => (
                    <Box
                      key={f.key}
                      sx={{
                        px: 2,
                        py: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        "&:last-child": { borderBottom: 0 },
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.originalName || f.key}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {f.key} ({(f.size / 1024).toFixed(1)} KB)
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={f.reason}
                          color={
                            f.reason === "orphaned" ? "warning" : "default"
                          }
                        />
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResult(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
