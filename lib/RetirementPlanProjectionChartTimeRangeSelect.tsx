import { ButtonBase, Stack } from "@mui/material"

export type RetirementPlanProjectionRange = "10Y" | "20Y" | "30Y" | "ALL"

const ranges: RetirementPlanProjectionRange[] = ["10Y", "20Y", "30Y", "ALL"]

interface Props {
  value: RetirementPlanProjectionRange
  onChange: (value: RetirementPlanProjectionRange) => void
}

export function RetirementPlanProjectionChartTimeRangeSelect({
  value,
  onChange,
}: Props) {
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
