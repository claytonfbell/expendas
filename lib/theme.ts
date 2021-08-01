import { ThemeOptions } from "@material-ui/core"

export const PRIMARY_COLOR = "#0088b3"

// Create a theme instance.
const theme: ThemeOptions = {
  palette: {
    primary: {
      main: "#0088b3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e0a800",
    },
  },

  overrides: {
    MuiTab: {
      root: {
        textTransform: "none",
      },
    },
  },
}

export const FAILED_COLOR = "#cb8f0d"
export const OK_COLOR = "#29ac47"

export default theme
