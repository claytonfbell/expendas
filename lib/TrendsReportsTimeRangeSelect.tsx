import { ButtonBase, Stack } from "@mui/material"

export type ReportRange =
  | "1W"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "2Y"
  | "5Y"
  | "10Y"
  | "ALL"

const ranges: ReportRange[] = [
  "1W",
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "2Y",
  "5Y",
  "10Y",
  "ALL",
]

interface Props {
  value: ReportRange
  onChange: (value: ReportRange) => void
}

export function TrendsReportsTimeRangeSelect({ value, onChange }: Props) {
  return (
    <Stack direction="row">
      {ranges.map((range) => (
        <ButtonBase
          key={range}
          sx={{
            minWidth: "48px",
            borderRadius: "200px",
            backgroundColor: value === range ? "primary.main" : "transparent",
            fontWeight: "normal",
            color: value === range ? "primary.contrastText" : "text.primary",
            padding: "6px 12px",
          }}
          onClick={() => onChange(range)}
        >
          {range}
        </ButtonBase>
      ))}
    </Stack>
  )
}
