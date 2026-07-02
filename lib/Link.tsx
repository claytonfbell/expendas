import { Link as MUILink } from "@mui/material"
import { Link as TanStackLink } from "@tanstack/react-router"
import React from "react"

interface Props {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}

export function Link(props: Props) {
  return (
    <MUILink
      color="inherit"
      style={{ cursor: "pointer" }}
      onClick={props.onClick}
      component={props.href !== undefined ? TanStackLink : "a"}
      to={props.href}
    >
      {props.children}
    </MUILink>
  )
}
