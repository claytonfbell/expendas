import {
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
  Checkbox,
  Stack,
  TextField,
} from "@mui/material"
import { AssetType } from "@prisma/client"
import { useEffect, useState } from "react"
import { AssetTicker } from "@prisma/client"
import { useAddAssetTicker } from "./api/hooks/useAddAssetTicker"
import { useUpdateAssetTicker } from "./api/hooks/useUpdateAssetTicker"
import { useRemoveAssetTicker } from "./api/hooks/useRemoveAssetTicker"
import DisplayError from "./DisplayError"
import { Title } from "./Title"
import ConfirmDialog from "./ConfirmDialog"

const ASSET_TYPE_OPTIONS: AssetType[] = ["Equity", "Fixed_Income"]

interface Props {
  assetTicker: AssetTicker | null | undefined
  onClose: () => void
}

export function AssetTickerDialog(props: Props) {
  const isOpen = props.assetTicker !== undefined

  return (
    <Dialog
      open={isOpen}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent>
        {props.assetTicker !== undefined && (
          <AssetTickerDialogContent
            assetTicker={props.assetTicker}
            onClose={props.onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function AssetTickerDialogContent({
  assetTicker,
  onClose,
}: {
  assetTicker: AssetTicker | null
  onClose: () => void
}) {
  const isEditing = assetTicker !== null

  const [ticker, setTicker] = useState("")
  const [assetType, setAssetType] = useState<AssetType>("Equity")
  const [dividendApr, setDividendApr] = useState("0.00")
  const [tickerDisplayName, setTickerDisplayName] = useState("")
  const [lookup, setLookup] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (assetTicker) {
      setTicker(assetTicker.ticker)
      setAssetType(assetTicker.assetType)
      setDividendApr((assetTicker.dividendApr / 100).toFixed(2))
      setTickerDisplayName(assetTicker.tickerDisplayName)
      setLookup(assetTicker.lookup)
    } else {
      setTicker("")
      setAssetType("Equity")
      setDividendApr("0.00")
      setTickerDisplayName("")
      setLookup(true)
    }
  }, [assetTicker])

  const {
    mutateAsync: addAssetTicker,
    isPending: isAdding,
    error: addError,
  } = useAddAssetTicker()
  const {
    mutateAsync: updateAssetTicker,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateAssetTicker()
  const {
    mutateAsync: removeAssetTicker,
    isPending: isDeleting,
    error: deleteError,
  } = useRemoveAssetTicker()
  const error = addError || updateError || deleteError

  const busy = isAdding || isUpdating || isDeleting

  async function handleSubmit() {
    const dividendAprBps = Math.round(parseFloat(dividendApr) * 100)
    if (isNaN(dividendAprBps)) return

    if (isEditing && assetTicker) {
      await updateAssetTicker({
        id: assetTicker.id,
        ticker,
        assetType,
        dividendApr: dividendAprBps,
        tickerDisplayName,
        lookup,
      })
    } else {
      await addAssetTicker({
        ticker,
        assetType,
        dividendApr: dividendAprBps,
        tickerDisplayName,
        lookup,
      })
    }
    onClose()
  }

  async function handleDelete() {
    if (assetTicker) {
      await removeAssetTicker(assetTicker.id)
      setConfirmDelete(false)
      onClose()
    }
  }

  return (
    <>
      <Title label={isEditing ? "Edit Asset Ticker" : "Add Asset Ticker"} />

      <Stack spacing={2}>
        <DisplayError error={error} />

        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          size="small"
          fullWidth
          disabled={busy || isEditing}
        />

        <TextField
          label="Display Name"
          value={tickerDisplayName}
          onChange={(e) => setTickerDisplayName(e.target.value)}
          size="small"
          fullWidth
          disabled={busy}
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
          label="Dividend APR (%)"
          value={dividendApr}
          onChange={(e) => setDividendApr(e.target.value)}
          size="small"
          type="number"
          fullWidth
          disabled={busy}
          slotProps={{
            htmlInput: { step: "0.01", min: "0" },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={lookup}
              onChange={(e) => setLookup(e.target.checked)}
              disabled={busy}
            />
          }
          label="Lookup market prices (uncheck for fixed $1.00/share price, e.g. T-bills and CDs)"
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              busy ||
              ticker.length === 0 ||
              tickerDisplayName.length === 0
            }
          >
            {isEditing ? "Update Asset Ticker" : "Add Asset Ticker"}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          {isEditing && (
            <Button
              variant="text"
              color="error"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <ConfirmDialog
        open={confirmDelete}
        message="Delete Asset Ticker?"
        details="This will permanently remove the asset ticker. Make sure no assets are using it."
        yesLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onAccept={handleDelete}
      />
    </>
  )
}
