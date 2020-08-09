import { CssBaseline, Typography } from "@material-ui/core"
import Container from "@material-ui/core/Container"
import React from "react"

interface Props {
  title: string
  children: React.ReactNode
}

export default function StartLayout(props: Props) {
  return (
    <>
      <CssBaseline />
      <br />
      <br />
      <Container maxWidth="xs">
        <Typography variant="h1">{props.title}</Typography>
        {props.children}
      </Container>
    </>
  )
}
