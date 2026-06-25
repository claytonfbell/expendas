import { Box } from "@mui/material"
import React from "react"
import ReactMarkdown from "react-markdown"

interface Props {
  details: string | null
}

export function Details(props: Props) {
  return (
    <Box style={{ maxWidth: 700 }} sx={{
      overflow: "auto"
    }}>
      {props.details !== null ? (
        <ReactMarkdown>{props.details}</ReactMarkdown>
      ) : null}
    </Box>
  );
}
