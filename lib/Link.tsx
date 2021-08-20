import { Link as MUILink } from "@material-ui/core"
import NextLink from "next/link"
import React from "react"

interface Props {
  href?: string
  onClick?: () => void
  children: React.ReactNode
}

export function Link(props: Props) {
  const muiLink = (
    <MUILink
      color="inherit"
      style={{ cursor: "pointer" }}
      onClick={props.onClick}
    >
      {props.children}
    </MUILink>
  )

  return props.href !== undefined ? (
    <NextLink href={props.href}>{muiLink}</NextLink>
  ) : (
    muiLink
  )
}
