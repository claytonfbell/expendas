import { ButtonBase, Stack } from "@mui/material"
import { alpha } from "@mui/material/styles"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { navigationLinks } from "./TopNavigation"

export function BottomMobileNavigation() {
  const router = useRouter()
  return (
    <Stack
      display={{ xs: "flex", md: "none" }}
      direction="row"
      spacing={0}
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
      justifyContent={"stretch"}
      alignItems={"start"}
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
              height: "100%",
              backgroundColor: isSelected
                ? (theme) => alpha(theme.palette.secondary.main, 0.1)
                : "transparent",
            }}
          >
            <Stack
              sx={{
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                fontSize: 13,
                paddingTop: 1,
                paddingBottom: 0.5,
                lineHeight: "16px",
                color: isSelected
                  ? (theme) => theme.palette.text.primary
                  : (theme) => alpha(theme.palette.text.primary, 0.6),
              }}
              alignItems="center"
              textAlign={"center"}
              spacing={0.5}
              width="100%"
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
