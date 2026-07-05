import { Stack, StackProps } from "@mui/material"
import type { ReactNode } from "react"

interface Props extends StackProps {
  children: ReactNode
}

export function StatBoxContainer({ children }: Props) {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
      {children}
    </Stack>
  )
}
