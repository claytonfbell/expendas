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
import { Asset, AssetType } from "@prisma/client"
import { useState } from "react"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { AmountInputTool } from "./AmountInputTool"
import DisplayError from "./DisplayError"
import { Title } from "./Title"
import { useAddAsset } from "./api/hooks/useAddAsset"
import { useDeleteAsset } from "./api/hooks/useDeleteAsset"
import { useFetchAssets } from "./api/hooks/useFetchAssets"
import { useUpdateAsset } from "./api/hooks/useUpdateAsset"
import { getTickerDisplayName, tickerDisplayNames } from "./tickerDisplayNames"

const ASSET_TYPE_OPTIONS: AssetType[] = ["Equity", "Fixed_Income"]
const TICKER_OPTIONS = Object.keys(tickerDisplayNames)

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
  const [editAsset, setEditAsset] = useState<Asset | undefined>()
  const [ticker, setTicker] = useState("")
  const [assetType, setAssetType] = useState<AssetType>("Equity")
  const [currentBalance, setCurrentBalance] = useState("")

  const { data: assets } = useFetchAssets(account.id)

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
    setTicker("")
    setAssetType("Equity")
    setCurrentBalance("")
    setShowForm(true)
  }

  function handleStartEdit(asset: Asset) {
    setEditAsset(asset)
    setTicker(asset.ticker)
    setAssetType(asset.assetType)
    setCurrentBalance((asset.balance / 100).toFixed(2))
    setShowForm(true)
  }

  async function handleSubmit() {
    const balanceInPennies = Math.round(parseFloat(currentBalance) * 100)
    if (isNaN(balanceInPennies) || balanceInPennies <= 0) return

    if (editAsset) {
      await updateAsset({
        assetId: editAsset.id,
        accountId: account.id,
        ticker,
        assetType,
        currentBalance: balanceInPennies,
      })
    } else {
      await addAsset({
        accountId: account.id,
        ticker,
        assetType,
        currentBalance: balanceInPennies,
      })
    }
    setShowForm(false)
    setEditAsset(undefined)
  }

  async function handleDelete(asset: Asset) {
    await deleteAsset({
      assetId: asset.id,
      accountId: account.id,
    })
  }

  const busy = isAdding || isUpdating || isDeleting

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
                  <Typography>{getTickerDisplayName(asset.ticker)}</Typography>
                </TableCell>
                <TableCell>{asset.assetType.replace("_", " ")}</TableCell>
                <TableCell align="right">
                  <AmountInputTool
                    enabled
                    value={asset.balance}
                    onChange={(newBalance) =>
                      updateAsset({
                        assetId: asset.id,
                        accountId: account.id,
                        ticker: asset.ticker,
                        assetType: asset.assetType,
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
              freeSolo
              options={TICKER_OPTIONS}
              value={ticker}
              onChange={(_, value) => setTicker((value ?? "").toUpperCase())}
              onInputChange={(_, value) => setTicker(value.toUpperCase())}
              renderInput={(params) => (
                <TextField {...params} label="Ticker" size="small" />
              )}
              disabled={busy}
              fullWidth
            />
            <TextField
              label="Asset Type"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              select
              size="small"
              fullWidth
              disabled={busy}
              slotProps={{
                select: { native: true },
              }}
            >
              {ASSET_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("_", " ")}
                </option>
              ))}
            </TextField>
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
                disabled={busy || ticker.length === 0 || currentBalance === ""}
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
