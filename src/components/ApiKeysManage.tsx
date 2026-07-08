import VpnKeyIcon from "@mui/icons-material/VpnKey"
import {
  Box,
  Button,
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
import React, { useState } from "react"
import { useCreateApiKey } from "./api/hooks/useCreateApiKey"
import { useFetchApiKeys } from "./api/hooks/useFetchApiKeys"
import { useRevokeApiKey } from "./api/hooks/useRevokeApiKey"
import ConfirmDialog from "./ConfirmDialog"

function maskKey(key: string): string {
  if (key.length <= 8) return key
  return key.slice(0, 4) + "…" + key.slice(-4)
}

export function ApiKeysManage() {
  const { data: keys, refetch } = useFetchApiKeys()
  const { mutateAsync: createKey } = useCreateApiKey()
  const { mutateAsync: revokeKey } = useRevokeApiKey()

  const [newKeyValue, setNewKeyValue] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<number | null>(null)

  const handleCreate = async () => {
    const result = await createKey()
    setNewKeyValue(result.key)
  }

  const handleRevoke = async () => {
    if (revokeId !== null) {
      await revokeKey(revokeId)
      setRevokeId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button variant="contained" startIcon={<VpnKeyIcon />} onClick={handleCreate}>
          Create New API Key
        </Button>
      </Box>

      {newKeyValue !== null && (
        <Paper sx={{ p: 3, bgcolor: "success.light" }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            New API Key Created
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Copy this key now. You will not be able to see it again.
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.875rem",
              wordBreak: "break-all",
              border: 1,
              borderColor: "divider",
            }}
          >
            {newKeyValue}
          </Box>
          <Button
            sx={{ mt: 1 }}
            variant="outlined"
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(newKeyValue)
            }}
          >
            Copy to Clipboard
          </Button>
          <Button
            sx={{ mt: 1, ml: 1 }}
            variant="text"
            size="small"
            onClick={() => setNewKeyValue(null)}
          >
            Dismiss
          </Button>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Key</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No API keys yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                    {maskKey(k.key)}
                  </TableCell>
                  <TableCell>{dayjs(k.createdAt).format("MMM D, YYYY")}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setRevokeId(k.id)}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={revokeId !== null}
        message="Revoke API Key?"
        details="This will permanently revoke the API key. Any services using this key will no longer be able to access the API."
        yesLabel="Revoke"
        onClose={() => setRevokeId(null)}
        onAccept={handleRevoke}
      />

      <Box sx={{ mt: 2 }}>
        <Button variant="text" href="/api-docs">
          View API Documentation
        </Button>
      </Box>
    </Stack>
  )
}