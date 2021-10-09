import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import { styled } from "@mui/system"
import React from "react"
import AnimatedCounter from "./AnimatedCounter"
import { formatMoney } from "./formatMoney"

const StyledSpan = styled("span")``

interface Props {
  value: number
  animate?: boolean
  bold?: boolean
  red?: boolean
  green?: boolean
  arrow?: boolean
}
export function Currency(props: Props) {
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
        color:
          props.value < 0 && props.red
            ? RED
            : props.value > 0 && props.green
            ? GREEN
            : undefined,
        fontWeight: props.bold ? "bold" : undefined,
      }}
    >
      {props.arrow && props.value > 0 ? UP_ARROW : null}
      {props.arrow && props.value < 0 ? DOWN_ARROW : null}

      {props.animate ? (
        <AnimatedCounter value={props.value} />
      ) : (
        formatMoney(props.value)
      )}
    </StyledSpan>
  )
}
