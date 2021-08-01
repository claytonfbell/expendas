import CheckIcon from "@material-ui/icons/Check"
import ReportProblemIcon from "@material-ui/icons/ReportProblem"
import React from "react"
import { FAILED_COLOR, OK_COLOR } from "./theme"

interface Props {
  success: boolean
  fontSize?: "small" | "inherit" | "large" | "default" | undefined
}

export function StatusIcon({ fontSize = "large", success }: Props) {
  return (
    <>
      {success ? (
        <CheckIcon fontSize={fontSize} style={{ color: OK_COLOR }} />
      ) : (
        <ReportProblemIcon
          fontSize={fontSize}
          style={{ color: FAILED_COLOR }}
        />
      )}
    </>
  )
}
