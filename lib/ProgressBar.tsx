import { Box } from "@material-ui/core"
import ReactProgressBar from "@ramonak/react-progress-bar"
import React from "react"
import { FAILED_COLOR, OK_COLOR } from "./theme"

interface Props {
  progress: number | null
  success: boolean
  width: number
}

export function ProgressBar(props: Props) {
  return (
    <>
      {props.progress !== null ? (
        <Box style={{ marginTop: 8, marginBottom: 8 }}>
          <ReactProgressBar
            width={`${props.width}px`}
            bgColor={props.success ? OK_COLOR : FAILED_COLOR}
            labelAlignment="center"
            completed={props.progress}
            isLabelVisible={false}
            height="8px"
          />
        </Box>
      ) : null}
    </>
  )
}
