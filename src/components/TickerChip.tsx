import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { Box, Chip, Tooltip, useTheme } from "@mui/material"
import { useState } from "react"
import type { TickerPriceData } from "../app/api/tickerPrices"
import { AmountInput } from "./AmountInput"
import { formatMoney } from "./formatMoney"
import { getTickerDisplayName } from "./tickerDisplayNames"

function formatAbbreviated(pennies: number): string {
  const dollars = Math.round(pennies / 100)
  const abs = Math.abs(dollars)
  if (abs >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(0).replace(/\.0$/, "")}M`
  }
  if (abs >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0).replace(/\.0$/, "")}k`
  }
  return `$${dollars}`
}

interface Props {
  ticker: string
  balance: number
  assetType: string
  prices: TickerPriceData | undefined
  onChange: (newBalance: number) => void
}

export function TickerChip({
  ticker,
  balance,
  assetType,
  prices,
  onChange,
}: Props) {
  const theme = useTheme()
  const [editing, setEditing] = useState(false)

  const pctChange =
    prices && prices.previousPrice > 0
      ? ((prices.currentPrice - prices.previousPrice) / prices.previousPrice) *
        100
      : null

  const balanceDiff =
    prices && prices.currentPrice > 0
      ? Math.round(
          balance - (balance / prices.currentPrice) * prices.previousPrice
        )
      : null

  const direction =
    pctChange === 0 || pctChange === null ? null : pctChange > 0 ? "up" : "down"

  const pctColor =
    direction === "up"
      ? theme.palette.success.main
      : direction === "down"
        ? theme.palette.error.main
        : theme.palette.text.primary

  if (editing) {
    return (
      <AmountInput
        value={balance}
        onChange={(newBalance) => {
          onChange(newBalance)
          setEditing(false)
        }}
      />
    )
  }

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: "center" }}>
          {balanceDiff !== null && (
            <Box>
              <PlayArrowIcon
                sx={{
                  fontSize: 14,
                  verticalAlign: "middle",
                  transform:
                    direction === "up" ? "rotate(-90deg)" : "rotate(90deg)",
                  color: pctColor,
                }}
              />
              <span style={{ color: pctColor }}>
                {formatMoney(balanceDiff, true)} ({pctChange?.toFixed(1)}%)
              </span>
            </Box>
          )}
        </Box>
      }
    >
      <Chip
        color={
          assetType === "Equity"
            ? "primary"
            : assetType === "Fixed_Income"
              ? "secondary"
              : "default"
        }
        label={`${formatAbbreviated(balance)} ${getTickerDisplayName(ticker)}`}
        size="small"
        variant="outlined"
        onClick={() => setEditing(true)}
      />
    </Tooltip>
  )
}
