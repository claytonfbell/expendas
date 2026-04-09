import { ButtonBase, Stack, useMediaQuery, useTheme } from "@mui/material"

export type ReportRange =
  | "1W"
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "2Y"
  | "ALL"

const ranges: ReportRange[] = ["1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "ALL"]

interface Props {
  value: ReportRange
  onChange: (value: ReportRange) => void
}

export function TrendsReportsTimeRangeSelect({ value, onChange }: Props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  return (
    <Stack direction="row">
      {ranges
        // discard 1W and 2Y on mobile
        .filter((range) => {
          if (isMobile) {
            return range !== "1W" && range !== "2Y"
          }
          return true
        })
        .map((range) => (
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
