import { makeStyles } from "@material-ui/core"
import React from "react"
import AnimatedCounter from "./AnimatedCounter"
import { formatMoney } from "./formatMoney"

const useStyles = makeStyles({
  root: {
    fontFamily: `'Roboto Mono', monospace`,
    whiteSpace: "nowrap",
  },
})

interface Props {
  value: number
  animate?: boolean
  bold?: boolean
  red?: boolean
  green?: boolean
}
export function Currency(props: Props) {
  const classes = useStyles()
  const RED = "#c82333"
  const GREEN = "#0c9c58"

  return (
    <span
      className={classes.root}
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
