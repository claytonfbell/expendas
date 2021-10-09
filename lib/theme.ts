import { ThemeOptions } from "@mui/material"

export const PRIMARY_COLOR = "#0088b3"

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
  typography: {
    fontSize: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
        },
      },
    },
  },
}

export const FAILED_COLOR = "#cb8f0d"
export const OK_COLOR = "#29ac47"

export default theme
