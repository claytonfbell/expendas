import React from "react"
import AnimatedCounter from "../AnimatedCounter"
import { formatMoney } from "../shared/formatMoney"

interface Props {
  value: number
  animate?: boolean
  bold?: boolean
  red?: boolean
  green?: boolean
}
export function Currency(props: Props) {
  const RED = "#c82333"
  const GREEN = "#0c9c58"

  return (
    <span
      style={{
        color:
          props.value < 0 && props.red
            ? RED
            : props.value > 0 && props.green
            ? GREEN
            : undefined,
        fontWeight: props.bold ? "bold" : undefined,
      }}
    >
      {props.animate ? (
        <AnimatedCounter value={props.value} />
      ) : (
        formatMoney(props.value)
      )}
    </span>
  )
}
