import { Box, Link } from "@mui/material"
import React from "react"
import { AmountInput } from "./AmountInput"
import { Currency } from "./Currency"

type Props = {
  value: number
  onChange: (newValue: number) => void
  enabled?: boolean
  green?: boolean
  minWidth?: number
}
export function AmountInputTool(props: Props) {
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
              "&:hover": {
                textDecoration: "underline",
              },
            }}
            onClick={() => setOpen(true)}
          >
            <Currency green={props.green} value={value} />
          </Link>
        )
      ) : (
        <Currency green={props.green} value={value} />
      )}
    </Box>
  )
}
