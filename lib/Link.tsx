import { Link as MUILink } from "@mui/material"
import NextLink from "next/link"
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
      component={props.href !== undefined ? NextLink : "a"}
      href={props.href}
    >
      {props.children}
    </MUILink>
  )
}
