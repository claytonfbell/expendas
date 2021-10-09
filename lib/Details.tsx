import { Box } from "@mui/material"
import React from "react"
import ReactMarkdown from "react-markdown"

interface Props {
  details: string | null
}

export function Details(props: Props) {
  return (
    <Box overflow="auto" style={{ maxWidth: 700 }}>
      {props.details !== null ? (
        <ReactMarkdown>{props.details}</ReactMarkdown>
      ) : null}
    </Box>
  )
}
