import { Stack, Typography } from "@mui/material"
import type { ReactNode } from "react"

interface StatBoxProps {
  title: string
  titleColor?: string
  value: ReactNode
  subtitle?: ReactNode
}

export function StatBox({ title, titleColor, value, subtitle }: StatBoxProps) {
  return (
    <Stack
      sx={{
        flex: 1,
        minWidth: 120,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        padding: 2,
        alignItems: "center",
      }}
    >
      <Typography
        noWrap
        variant="subtitle1"
        sx={{
          maxWidth: "100%",
          color: titleColor,
          fontWeight: "bold",
        }}
      >
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
      {subtitle != null && (
        <Typography
          noWrap
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: "100%" }}
        >
          {subtitle}
        </Typography>
      )}
    </Stack>
  )
}