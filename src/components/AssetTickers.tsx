import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import { Button, IconButton, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { AssetTicker } from "@prisma/client"
import { useFetchAssetTickers } from "./api/hooks/useFetchAssetTickers"
import { useRemoveAssetTicker } from "./api/hooks/useRemoveAssetTicker"
import { ExpendasTable } from "./ExpendasTable"
import { AssetTickerDialog } from "./AssetTickerDialog"
import { BottomStatusBar } from "./BottomStatusBar"
import ConfirmDialog from "./ConfirmDialog"

export function AssetTickers() {
  const { data: assetTickers } = useFetchAssetTickers()
  const { mutateAsync: removeAssetTicker } = useRemoveAssetTicker()

  const [editTicker, setEditTicker] = useState<AssetTicker | null | undefined>(
    undefined
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleAdd = () => {
    setEditTicker(null)
  }

  const handleEdit = (ticker: AssetTicker) => {
    setEditTicker(ticker)
  }

  const handleDelete = async () => {
    if (deleteId !== null) {
      await removeAssetTicker(deleteId)
      setDeleteId(null)
    }
  }

  const formatDividendApr = (bps: number) => {
    return `${(bps / 100).toFixed(2)}%`
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Asset Ticker
        </Button>
      </Stack>

      <ExpendasTable>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Display Name</th>
            <th>Asset Type</th>
            <th>Dividend APR</th>
            <th>Price Lookup</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assetTickers.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "16px" }}>
                <Typography color="text.secondary">
                  No asset tickers yet. Add one to get started.
                </Typography>
              </td>
            </tr>
          ) : (
            assetTickers.map((ticker) => (
              <tr key={ticker.id}>
                <td>{ticker.ticker}</td>
                <td>{ticker.tickerDisplayName}</td>
                <td>{ticker.assetType.replace("_", " ")}</td>
                <td>{formatDividendApr(ticker.dividendApr)}</td>
                <td>{ticker.lookup ? "Yes" : "No (fixed $1.00)"}</td>
                <td style={{ textAlign: "right" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(ticker)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteId(ticker.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </ExpendasTable>

      <AssetTickerDialog
        assetTicker={editTicker}
        onClose={() => setEditTicker(undefined)}
      />

      <ConfirmDialog
        open={deleteId !== null}
        message="Delete Asset Ticker?"
        details="This will permanently remove the asset ticker. Make sure no assets are using it."
        yesLabel="Delete"
        onClose={() => setDeleteId(null)}
        onAccept={handleDelete}
      />

      <BottomStatusBar />
    </Stack>
  )
}
