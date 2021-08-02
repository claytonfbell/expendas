import { Link as MUILink } from "@material-ui/core"
import NextLink from "next/link"
import React from "react"

interface Props {
  href: string
  children: React.ReactNode
}

export function Link(props: Props) {
  return (
    <NextLink href={props.href}>
      <MUILink color="inherit" style={{ cursor: "pointer" }}>
        {props.children}
      </MUILink>
    </NextLink>
  )
}
