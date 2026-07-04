import { ButtonBase, Stack } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { useRouter, Link as TanStackLink } from "@tanstack/react-router"
import { navigationLinks } from "./TopNavigation"

const bottomNavigationLinks = navigationLinks.filter(
  (link) => link.href !== "/mealsOut"
)

export function BottomMobileNavigation() {
  const router = useRouter()
  return (
    <Stack
      direction="row"
      spacing={0}
      sx={{
        display: { xs: "flex", md: "none" },
        justifyContent: "stretch",
        alignItems: "start",
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      {bottomNavigationLinks.map((link) => {
        const isSelected = router.state.location.pathname === link.href
        return (
          <ButtonBase
            key={link.href}
            component={TanStackLink}
            to={link.href}
            style={{ flex: 1 }}
            focusRipple
            sx={{
              height: "100%",
              backgroundColor: isSelected
                ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                : "transparent",
            }}
          >
            <Stack
              spacing={0.5}
              sx={{
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                fontSize: 13,
                paddingTop: 1,
                paddingBottom: 0.5,
                lineHeight: "16px",

                color: isSelected
                  ? (theme) => theme.palette.text.primary
                  : (theme) => alpha(theme.palette.text.primary, 0.6),
              }}
            >
              <Stack>{isSelected ? <link.ActiveIcon /> : <link.Icon />}</Stack>
              <Stack>{link.xsLabel ?? link.label}</Stack>
            </Stack>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}
