import { Box, Container, useTheme } from "@mui/material"
import React from "react"

interface Props {
  children: React.ReactNode
}

export function BottomStatusBar({ children }: Props) {
  const theme = useTheme()
  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          position: "fixed",
          bottom: 0,
          left: 0,
          width: `100vw`,
          paddingLeft: 0,
          paddingRight: theme.spacing(2),
          [theme.breakpoints.up("lg")]: {
            paddingRight: 0,
          },
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
          color: theme.palette.primary.contrastText,
          [theme.breakpoints.up("sm")]: {
            fontSize: 24,
          },
          "& .right": {
            textAlign: "right",
          },
        }}
      >
        <Container>{children}</Container>
      </Box>
    </>
  )
}
