import AssessmentIcon from "@mui/icons-material/Assessment"
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined"
import HomeIcon from "@mui/icons-material/Home"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined"
import SavingsIcon from "@mui/icons-material/Savings"
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined"
import RestaurantIcon from "@mui/icons-material/Restaurant"
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined"
import { Button, Stack, useMediaQuery } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { useRouter, Link as TanStackLink } from "@tanstack/react-router"
import React from "react"

type NavigationLink = {
  label: string
  xsLabel?: string
  mdLabel?: string
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
    label: "Fixed Income",
    xsLabel: "Fixed Inc.",
    mdLabel: "Fixed",
    href: "/fixedIncome",
    ActiveIcon: MonetizationOnIcon,
    Icon: MonetizationOnOutlinedIcon,
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
  {
    label: "Meals Out",
    href: "/mealsOut",
    ActiveIcon: RestaurantIcon,
    Icon: RestaurantOutlinedIcon,
  },
]

export function TopNavigation() {
  const router = useRouter()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down("lg"))
  return (
    <>
      <Stack
        direction="row"
        spacing={{ md: 0, lg: 2 }}
        sx={{
          alignItems: "center",
          display: { xs: "none", md: "flex" },
        }}
      >
        {navigationLinks.map((link) => {
          const isSelected = router.state.location.pathname === link.href
          return (
            <Button
              key={link.href}
              LinkComponent={TanStackLink}
              to={link.href}
              startIcon={isSelected ? <link.ActiveIcon /> : <link.Icon />}
              disableElevation
              sx={{
                color: (theme) =>
                  isSelected
                    ? theme.palette.text.primary
                    : alpha(theme.palette.text.primary, 0.6),
                backgroundColor: isSelected
                  ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                  : "transparent",
                paddingX: 2,
              }}
            >
              {isMd && link.mdLabel ? link.mdLabel : link.label}
            </Button>
          )
        })}
      </Stack>
    </>
  )
}
