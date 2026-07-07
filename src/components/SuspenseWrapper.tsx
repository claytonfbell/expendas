import { CircularProgress, Stack, Typography } from "@mui/material"
import { Suspense } from "react"

export function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <Stack
          sx={{
            height: "100vh",
            width: "100vw",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Stack
            spacing={2}
            sx={{ alignItems: "center", justifyContent: "center" }}
          >
            <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", opacity: 0.5 }}>LOADING</Typography>
            <CircularProgress size={128} />
          </Stack>
        </Stack>
      }
    >
      {children}
    </Suspense>
  )
}
