import { Typography, useMediaQuery, useTheme } from "@mui/material"
import React from "react"

interface Props {
  label: string | React.ReactNode
}

export function Title(props: Props) {
  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Typography
      style={{ fontSize: isXsDown ? 21 : 24, opacity: 0.8 }}
      component="div"
    >
      {props.label}
    </Typography>
  )
}
