import { Theme, alpha, lighten } from "@mui/material"
import { SxProps } from "@mui/system"

export const accountBoxStylesItem = (theme: Theme): SxProps<Theme> => ({
  color: theme.palette.text.primary,
  "&:nth-of-type(odd)": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  "&.paid": {
    textDecoration: "line-through",
    color: lighten(theme.palette.text.primary, 0.7),
  },
})

export const accountBoxStylesRight = (theme: Theme): SxProps<Theme> => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingRight: theme.spacing(2),
  textAlign: "right",
  "&.total": {
    borderTop: `2px solid ${lighten(theme.palette.primary.main, 0.5)}`,
  },
})
