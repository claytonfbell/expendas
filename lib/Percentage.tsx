import { makeStyles } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles({
  root: {
    fontFamily: `'Roboto Mono', monospace`,
    whiteSpace: "nowrap",
  },
})

interface Props {
  value: number
  bold?: boolean
  red?: boolean
  green?: boolean
}
export function Percentage(props: Props) {
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
      {(props.value * 100).toFixed(1)}%
    </span>
  )
}
