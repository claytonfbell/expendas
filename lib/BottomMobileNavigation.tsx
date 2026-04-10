import { ButtonBase, Stack } from "@mui/material"
import { alpha } from "@mui/material/styles"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { navigationLinks } from "./TopNavigation"

export function BottomMobileNavigation() {
  const router = useRouter()
  return (
    <Stack
      display={{ xs: "flex", sm: "none" }}
      direction="row"
      spacing={0}
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
      justifyContent={"stretch"}
    >
      {navigationLinks.map((link) => {
        const isSelected = router.pathname === link.href
        return (
          <ButtonBase
            key={link.href}
            component={NextLink}
            href={link.href}
            style={{ flex: 1 }}
            focusRipple
            sx={{
              backgroundColor: isSelected
                ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                : "transparent",
            }}
          >
            <Stack
              sx={{
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                fontSize: 14,
                paddingTop: 1,
                paddingBottom: 1,
                color: isSelected
                  ? (theme) => theme.palette.text.primary
                  : (theme) => alpha(theme.palette.text.primary, 0.6),
              }}
              alignItems="center"
              spacing={0.5}
              width="100%"
            >
              {isSelected ? <link.ActiveIcon /> : <link.Icon />}
              {link.label}
            </Stack>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}
