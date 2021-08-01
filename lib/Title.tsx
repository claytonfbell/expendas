import { Typography, useMediaQuery, useTheme } from "@material-ui/core"
import React from "react"

interface Props {
  label: string | React.ReactNode
}

export function Title(props: Props) {
  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Typography
      style={{ fontSize: isXsDown ? 21 : 24, opacity: 0.8 }}
      component="div"
    >
      {props.label}
    </Typography>
  )
}
