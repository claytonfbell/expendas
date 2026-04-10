import { Box, Container, useTheme } from "@mui/material"
import React from "react"
import { BottomMobileNavigation } from "./BottomMobileNavigation"

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

          fontSize: 20,

          paddingTop: 1,
          color: theme.palette.primary.contrastText,
          [theme.breakpoints.up("sm")]: {
            fontSize: 24,
          },
          "& .right": {
            textAlign: "right",
          },
          zIndex: theme.zIndex.appBar - 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container
          sx={{
            paddingBottom: 1,
          }}
        >
          <Box
            sx={{
              paddingRight: {
                xs: 0,
                sm: 1,
              },
            }}
          >
            {children}
          </Box>
        </Container>
        <BottomMobileNavigation />
      </Box>
    </>
  )
}
