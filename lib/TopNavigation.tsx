import AssessmentIcon from "@mui/icons-material/Assessment"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import HomeIcon from "@mui/icons-material/Home"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import SavingsIcon from "@mui/icons-material/Savings"
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined"
import { Button, Stack } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { useRouter } from "next/dist/client/router"
import NextLink from "next/link"
import React from "react"

type NavigationLink = {
  label: string
  href: string
  ActiveIcon: React.ElementType
  Icon: React.ElementType
}

export const navigationLinks: NavigationLink[] = [
  { label: "Home", href: "/", ActiveIcon: HomeIcon, Icon: HomeOutlinedIcon },
  {
    label: "Investments",
    href: "/investments",
    ActiveIcon: AssessmentIcon,
    Icon: AssessmentOutlinedIcon,
  },
  {
    label: "Trends",
    href: "/trends",
    ActiveIcon: ShowChartIcon,
    Icon: ShowChartOutlinedIcon,
  },
  {
    label: "Retirement",
    href: "/retirement",
    ActiveIcon: SavingsIcon,
    Icon: SavingsOutlinedIcon,
  },
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
            startIcon={isSelected ? <link.ActiveIcon /> : <link.Icon />}
            disableElevation
            sx={{
              color: (theme) =>
                isSelected
                  ? theme.palette.text.primary
                  : alpha(theme.palette.text.primary, 0.6),
              backgroundColor: isSelected
                ? (theme) => alpha(theme.palette.secondary.main, 0.2)
                : "transparent",
              paddingX: 2,
            }}
          >
            {link.label}
          </Button>
        )
      })}
    </Stack>
  )
}
