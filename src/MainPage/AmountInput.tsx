/* eslint-disable jsx-a11y/no-autofocus */
import { makeStyles, Theme } from "@material-ui/core"
import React, { KeyboardEvent, useEffect, useState } from "react"

const useStyles = makeStyles((theme: Theme) => ({
  inputAmount: {
    textAlign: "right",
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    width: 80,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: "transparent",
    "&::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
    MozAppearance: "textfield",
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
    if (e.key === "Backspace" && !firstKeyPressed) {
      setValue("")
    }

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

  return (
    <input
      autoFocus
      className={classes.inputAmount}
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/[^\d-.]/g, ""))}
      onBlur={() => props.onChange(dollarsToCents(value))}
      onKeyUp={handleKeyPress}
    />
  )
}
