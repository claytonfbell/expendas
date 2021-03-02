import { red } from "@material-ui/core/colors"
import { createMuiTheme } from "@material-ui/core/styles"

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#0088b3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e0a800",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif;",
    fontSize: 14,
    h1: {
      fontSize: 32,
      marginBottom: 16,
    },
  },
})

export default theme
