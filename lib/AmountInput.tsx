/* eslint-disable jsx-a11y/no-autofocus */
import {
  Box,
  Button,
  Fade,
  lighten,
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import React, { KeyboardEvent, useEffect, useState } from "react"
import useDebounce from "react-use/lib/useDebounce"

const useStyles = makeStyles((theme: Theme) => ({
  root: { position: "relative" },
  inputAmount: {
    textAlign: "right",
    fontFamily: `'Roboto Mono', monospace`,
    fontSize: theme.typography.fontSize,
    width: 80,
    lineHeight: 1,
    paddingRight: 0,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: "transparent",
    "&::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    MozAppearance: "textfield",
    outline: "none",
    border: 0,
    "&:focus": {
      outline: "none",
      border: 0,
      backgroundColor: lighten(theme.palette.primary.main, 0.7),
      borderRadius: 3,
    },
  },
  plusNegative: {
    position: "absolute",
    right: 84,
    fontSize: 12,
    minWidth: 48,
    padding: 0,
    margin: 0,
  },
}))

type Props = {
  value: number
  onChange: (value: number) => void
}

export function AmountInput(props: Props) {
  const classes = useStyles()

  const [value, setValue] = useState<string>(centsToDollars(props.value))
  useEffect(() => {
    setValue(centsToDollars(props.value))
  }, [props.value])

  const [isNegative, setIsNegative] = React.useState(false)
  React.useEffect(() => {
    setIsNegative(dollarsToCents(value) < 0)
  }, [value])

  function centsToDollars(pennies: number) {
    return (pennies / 100).toFixed(2)
  }

  function dollarsToCents(dollars: string) {
    dollars = Number(dollars).toFixed(2)
    return Number(dollars.replace(/[^\d-]/g, ""))
  }

  const [firstKeyPressed, setFirstKeyPressed] = useState(false)

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    // backspace clears input
    // if (e.key === "Backspace" && !firstKeyPressed) {
    //   setValue("")
    // }

    // escape key cancels by sending back original value
    if (e.key === "Escape") {
      props.onChange(props.value)
    }

    // enter key saves changes
    if (e.key === "Enter") {
      props.onChange(dollarsToCents(value))
    }

    setFirstKeyPressed(true)
  }

  function handleToggleNegative() {
    if (isNegative) {
      setValue(centsToDollars(Math.abs(dollarsToCents(value))))
    } else {
      setValue(centsToDollars(-1 * Math.abs(dollarsToCents(value))))
    }
    setClose((x) => x + 1)
  }

  const [close, setClose] = React.useState(0)
  useDebounce(
    () => {
      if (close > 0) {
        props.onChange(dollarsToCents(value))
      }
    },
    100,
    [close, props.onChange]
  )

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Box className={classes.root}>
      <Fade in={isXs} unmountOnExit>
        <Button
          className={classes.plusNegative}
          size="small"
          onClick={handleToggleNegative}
        >
          <RemoveIcon fontSize="inherit" /> /
          <AddIcon fontSize="inherit" />
        </Button>
      </Fade>
      <input
        className={classes.inputAmount}
        autoFocus
        type="text"
        pattern="[0-9]*"
        step="0.01"
        value={value}
        onChange={(e) => {
          let str = e.target.value
          // for ios num pads
          if (isXs) {
            str = str.replace(/[^\d-]/g, "")
            if (str.length > 2) {
              str = `${str.substr(0, str.length - 2)}.${str.substr(
                str.length - 2,
                2
              )}`
            }
          }
          // for full desktop
          else {
            str = str.replace(/[^\d-.]/g, "")
          }
          setValue(str)
        }}
        onKeyUp={handleKeyPress}
        onBlur={() => setClose((x) => x + 1)}
      />
    </Box>
  )
}
