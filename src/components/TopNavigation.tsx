import { Button, Stack, useMediaQuery } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { useRouter, Link as TanStackLink } from "@tanstack/react-router"
import { navigationLinks } from "./navigationLinks"

export function TopNavigation() {
  const router = useRouter()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down("lg"))
  const topLinks = navigationLinks.filter((link) =>
    link.navs.includes("top-desktop")
  )
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
        {topLinks.map((link) => {
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
