import { red } from "@material-ui/core/colors"
import { createMuiTheme } from "@material-ui/core/styles"

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#648821",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: "'Chilanka', sans-serif",
    h1: {
      fontSize: 32,
    },
  },
  props: {
    MuiButton: {
      style: {
        transition: "all .5s ease",
        outline: "none",
        boxShadow: "20px 38px 34px -26px hsla(0,0%,0%,.2)",
        borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
        border: "1px solid #666666",
      },
    },
    MuiTextField: {
      InputLabelProps: {
        style: { backgroundColor: "#fff", padding: 2 },
      },
      style: {
        transition: "all .5s ease",
        outline: "none",
        boxShadow: "20px 38px 34px -26px hsla(0,0%,0%,.2)",
        borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
        border: "1px solid #666666",
      },
    },
  },
})

export default theme
