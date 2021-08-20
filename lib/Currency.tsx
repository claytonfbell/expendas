import { makeStyles } from "@material-ui/core"
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown"
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp"
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
  arrow?: boolean
}
export function Currency(props: Props) {
  const classes = useStyles()
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
      {props.arrow && props.value > 0 ? UP_ARROW : null}
      {props.arrow && props.value < 0 ? DOWN_ARROW : null}

      {props.animate ? (
        <AnimatedCounter value={props.value} />
      ) : (
        formatMoney(props.value)
      )}
    </span>
  )
}
