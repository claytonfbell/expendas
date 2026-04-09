import AssessmentIcon from "@mui/icons-material/Assessment"
import HomeIcon from "@mui/icons-material/Home"
import SavingsIcon from "@mui/icons-material/Savings"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import { Button, Stack } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { useRouter } from "next/dist/client/router"
import NextLink from "next/link"
import React from "react"

type NavigationLink = {
  label: string
  href: string
  Icon: React.ElementType
}

export const navigationLinks: NavigationLink[] = [
  { label: "Home", href: "/", Icon: HomeIcon },
  { label: "Investments", href: "/investments", Icon: AssessmentIcon },
  { label: "Trends", href: "/trends", Icon: ShowChartIcon },
  { label: "Retirement", href: "/retirement", Icon: SavingsIcon },
]

export function TopNavigation() {
  const router = useRouter()
  return (
    <Stack
      direction="row"
      alignItems={"center"}
      spacing={2}
      display={{ xs: "none", lg: "flex" }}
    >
      {navigationLinks.map((link) => {
        const isSelected = router.pathname === link.href
        return (
          <Button
            key={link.href}
            LinkComponent={NextLink}
            href={link.href}
            startIcon={<link.Icon />}
            sx={{
              color: (theme) =>
                isSelected
                  ? theme.palette.text.primary
                  : alpha(theme.palette.text.primary, 0.6),
              fontWeight: isSelected ? "bold" : undefined,
            }}
          >
            {link.label}
          </Button>
        )
      })}
    </Stack>
  )
}
