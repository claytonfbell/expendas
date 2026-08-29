import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { AssetTicker } from "@prisma/client"
import { useState } from "react"
import { AccountWithIncludes, AssetWithTicker } from "./AccountWithIncludes"
import { AmountInputTool } from "./AmountInputTool"
import DisplayError from "./DisplayError"
import { Title } from "./Title"
import { useAddAsset } from "./api/hooks/useAddAsset"
import { useDeleteAsset } from "./api/hooks/useDeleteAsset"
import { useFetchAssets } from "./api/hooks/useFetchAssets"
import { useFetchAssetTickers } from "./api/hooks/useFetchAssetTickers"
import { useUpdateAsset } from "./api/hooks/useUpdateAsset"

interface Props {
  account: AccountWithIncludes | undefined
  onClose: () => void
}

export function AssetDialog(props: Props) {
  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("sm"))
  const isOpen = props.account !== undefined

  return (
    <Dialog
      open={isOpen}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        {props.account !== undefined && (
          <AssetDialogContent account={props.account} onClose={props.onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssetDialogContent({
  account,
  onClose,
}: {
  account: AccountWithIncludes
  onClose: () => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState<AssetWithTicker | undefined>()
  const [assetTickerId, setAssetTickerId] = useState<number | null>(null)
  const [currentBalance, setCurrentBalance] = useState("")

  const { data: assets } = useFetchAssets(account.id)
  const { data: assetTickers } = useFetchAssetTickers()

  const {
    mutateAsync: addAsset,
    isPending: isAdding,
    error: addError,
  } = useAddAsset()
  const {
    mutateAsync: updateAsset,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateAsset()
  const {
    mutateAsync: deleteAsset,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteAsset()
  const error = addError || updateError || deleteError

  function handleStartAdd() {
    setEditAsset(undefined)
    setAssetTickerId(null)
    setCurrentBalance("")
    setShowForm(true)
  }

  function handleStartEdit(asset: AssetWithTicker) {
    setEditAsset(asset)
    setAssetTickerId(asset.assetTickerId)
    setCurrentBalance((asset.balance / 100).toFixed(2))
    setShowForm(true)
  }

  async function handleSubmit() {
    const balanceInPennies = Math.round(parseFloat(currentBalance) * 100)
    if (isNaN(balanceInPennies) || balanceInPennies <= 0) return
    if (assetTickerId === null) return

    if (editAsset) {
      await updateAsset({
        assetId: editAsset.id,
        accountId: account.id,
        assetTickerId,
        currentBalance: balanceInPennies,
      })
    } else {
      await addAsset({
        accountId: account.id,
        assetTickerId,
        currentBalance: balanceInPennies,
      })
    }
    setShowForm(false)
    setEditAsset(undefined)
  }

  async function handleDelete(asset: AssetWithTicker) {
    await deleteAsset({
      assetId: asset.id,
      accountId: account.id,
    })
  }

  const busy = isAdding || isUpdating || isDeleting
  const selectedTicker = assetTickers.find((t) => t.id === assetTickerId) || null

  return (
    <>
      <Title label={`Assets - ${account.name}`} />

      <Stack spacing={2}>
        <DisplayError error={error} />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell align="right" sx={{ width: 100 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>
                  <Typography>{asset.assetTicker.tickerDisplayName}</Typography>
                </TableCell>
                <TableCell>{asset.assetTicker.assetType.replace("_", " ")}</TableCell>
                <TableCell align="right">
                  <AmountInputTool
                    enabled
                    value={asset.balance}
                    onChange={(newBalance) =>
                      updateAsset({
                        assetId: asset.id,
                        accountId: account.id,
                        assetTickerId: asset.assetTickerId,
                        currentBalance: newBalance,
                      })
                    }
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleStartEdit(asset)}
                    disabled={busy}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(asset)}
                    disabled={busy}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    No assets yet. Add one below.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {!showForm ? (
          <Button variant="outlined" onClick={handleStartAdd}>
            Add Asset
          </Button>
        ) : (
          <Stack spacing={2}>
            <Autocomplete
              options={assetTickers}
              getOptionLabel={(option: AssetTicker) =>
                `${option.ticker} (${option.tickerDisplayName})`
              }
              value={selectedTicker}
              onChange={(_, value) =>
                setAssetTickerId(value ? value.id : null)
              }
              renderInput={(params) => (
                <TextField {...params} label="Ticker" size="small" />
              )}
              disabled={busy}
              fullWidth
            />
            <TextField
              label="Current Balance ($)"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              size="small"
              type="number"
              fullWidth
              disabled={busy}
              slotProps={{
                htmlInput: { step: "0.01", min: "0.01" },
              }}
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={busy || assetTickerId === null || currentBalance === ""}
              >
                {editAsset ? "Update Asset" : "Add Asset"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowForm(false)
                  setEditAsset(undefined)
                }}
                disabled={busy}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
      <br />
      <Button variant="outlined" onClick={onClose}>
        Close
      </Button>
    </>
  )
}
