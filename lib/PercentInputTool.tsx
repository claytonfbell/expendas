import { Box, Link } from "@mui/material"
import React from "react"
import { AmountInput } from "./AmountInput"

type Props = {
  value: number
  onChange: (newValue: number) => void
  enabled?: boolean
  minWidth?: number
}
export function PercentInputTool(props: Props) {
  const { enabled, value, onChange, minWidth } = props
  const [open, setOpen] = React.useState(false)

  function handleChange(newValue: number) {
    setOpen(false)
    onChange(newValue)
  }

  return (
    <Box sx={{ minWidth: minWidth }}>
      {enabled ? (
        open ? (
          <AmountInput value={value} onChange={handleChange} />
        ) : (
          <Link
            color="inherit"
            sx={{
              cursor: "pointer",
            }}
            onClick={() => setOpen(true)}
          >
            {value / 100}%
          </Link>
        )
      ) : (
        <>{value / 100}%</>
      )}
    </Box>
  )
}
