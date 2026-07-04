import { TextField, TextFieldProps } from "@mui/material"
import { useCallback, useEffect, useState } from "react"

type MoneyUnit = "default" | "cents"

interface Props extends Omit<TextFieldProps, "value" | "onChange" | "type"> {
  value: number
  onChange: (value: number) => void
  unit?: MoneyUnit
}

function formatDisplayValue(value: number, unit: MoneyUnit): string {
  if (value === 0) return ""
  if (unit === "cents") {
    return (value / 100).toFixed(2)
  }
  return value.toFixed(2)
}

function parseDisplayValue(display: string, unit: MoneyUnit): number {
  const parsed = parseFloat(display)
  if (isNaN(parsed)) return 0
  if (unit === "cents") {
    return Math.round(parsed * 100)
  }
  return Math.round(parsed * 100) / 100
}

export function MoneyTextField({ value, onChange, unit = "default", ...props }: Props) {
  const [display, setDisplay] = useState(() => formatDisplayValue(value, unit))

  useEffect(() => {
    setDisplay(formatDisplayValue(value, unit))
  }, [value, unit])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (/^\d*\.?\d*$/.test(raw)) {
        setDisplay(raw)
        onChange(parseDisplayValue(raw, unit))
      }
    },
    [onChange, unit],
  )

  const handleBlur = useCallback(() => {
    setDisplay(formatDisplayValue(value, unit))
  }, [value, unit])

  return (
    <TextField
      {...props}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{ htmlInput: { inputMode: "decimal" } }}
      size="small"
    />
  )
}