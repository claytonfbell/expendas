/* eslint-disable jsx-a11y/no-autofocus */
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import {
  Box,
  Button,
  Fade,
  lighten,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { styled } from "@mui/system"
import React, { KeyboardEvent, useEffect, useState } from "react"
import useDebounce from "react-use/lib/useDebounce"

type Props = {
  value: number
  onChange: (value: number) => void
}

const StyledInput = styled("input")``

export function AmountInput(props: Props) {
  const theme = useTheme()

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

  const isXs = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Box sx={{ position: "relative" }}>
      <Fade in={isXs} unmountOnExit>
        <Button
          sx={{
            position: "absolute",
            right: 84,
            fontSize: 12,
            minWidth: 48,
            padding: 0,
            margin: 0,
          }}
          size="small"
          onClick={handleToggleNegative}
        >
          <RemoveIcon fontSize="inherit" /> /
          <AddIcon fontSize="inherit" />
        </Button>
      </Fade>
      <StyledInput
        sx={{
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
        }}
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
