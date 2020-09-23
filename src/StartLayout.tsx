import { Box, CssBaseline, Grid, Hidden, Typography } from "@material-ui/core"
import LocalFloristIcon from "@material-ui/icons/LocalFlorist"
import { ReactNode } from "react"
import { SignInProvider } from "./SignInProvider"
interface Props {
  title: string
  children: ReactNode
}

export default function StartLayout(props: Props) {
  return (
    <SignInProvider>
      <CssBaseline />
      <Grid container justify="space-between">
        <Hidden xsDown>
          <Grid item sm={6} md={8} lg={9}>
            <Box
              style={{
                color: "#666",
                borderRight: "1px solid #ccc",
                height: "100vh",
                backgroundColor: "#eee",
                boxShadow: "20px 38px 34px -26px hsla(0,0%,0%,.2)",
                borderRadius: "255px 15px 225px 15px/15px 225px 15px 255px",
                textAlign: "center",
                paddingTop: 72,
              }}
            >
              <Typography variant="h1">expendas.com</Typography>
              <Typography>Tools to plan your spending.</Typography>
              <br />
              <br />
              <LocalFloristIcon
                color="inherit"
                fontSize="large"
                style={{ fontSize: 144 }}
              />
            </Box>
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Box padding={6}>
            <Typography variant="h1">{props.title}</Typography>
            {props.children}
          </Box>
        </Grid>
      </Grid>
    </SignInProvider>
  )
}
