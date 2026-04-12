import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import { styled } from "@mui/system"

const StyledSpan = styled("span")``

interface Props {
  value: number
  bold?: boolean
  red?: boolean
  green?: boolean
  arrow?: boolean
  decimals?: number
}
export function Percentage({
  value,
  bold,
  red,
  green,
  arrow,
  decimals = 1,
}: Props) {
  const RED = "#c82333"
  const GREEN = "#0c9c58"
  const DOWN_ARROW = (
    <ArrowDropDownIcon
      fontSize="inherit"
      style={{ fontSize: `1.5em`, marginBottom: -5 }}
    />
  )
  const UP_ARROW = (
    <ArrowDropUpIcon
      fontSize="inherit"
      style={{ fontSize: `1.5em`, marginBottom: -5 }}
    />
  )

  return (
    <StyledSpan
      sx={{
        fontFamily: `'Roboto Mono', monospace`,
        whiteSpace: "nowrap",
      }}
      style={{
        color: value < 0 && red ? RED : value > 0 && green ? GREEN : undefined,
        fontWeight: bold ? "bold" : undefined,
      }}
    >
      {arrow && value > 0 ? UP_ARROW : null}
      {arrow && value < 0 ? DOWN_ARROW : null}
      {(value * 100).toLocaleString(undefined, {
        maximumFractionDigits: decimals,
      })}
      %
    </StyledSpan>
  )
}
