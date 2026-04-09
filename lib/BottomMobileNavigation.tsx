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
      maxWidth={420}
      sx={{
        backgroundColor: "#000000",
      }}
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
          >
            <Stack
              sx={{
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                fontSize: 14,
                paddingTop: 2,
                paddingBottom: 2,
                color: isSelected
                  ? (theme) => "#ffffff"
                  : (theme) => alpha("#ffffff", 0.4),
              }}
              alignItems="center"
              spacing={0.5}
              width="100%"
            >
              {link.label}
              <link.Icon />
            </Stack>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}
