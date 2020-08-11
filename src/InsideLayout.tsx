import {
  AppBar,
  CssBaseline,
  Grid,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Button from "material-ui-bootstrap/dist/Button"
import Link from "next/link"
import React from "react"
import { AccountProvider } from "./AccountProvider"
import { CycleProvider } from "./CycleProvider"
import { PaymentProvider } from "./PaymentProvider"
import { SignInProvider, useSignIn } from "./SignInProvider"

const useStyles = makeStyles({
  root: {
    "& a": {
      color: "white",
    },
  },
})

interface Props {
  title: string
  children: React.ReactNode
}

function Content(props: Props) {
  const { requireAuthentication, signOut } = useSignIn()
  requireAuthentication()
  const classes = useStyles()
  return (
    <SignInProvider>
      <AppBar color="primary" className={classes.root}>
        <Toolbar>
          <Grid container justify="space-between">
            <Grid item>
              <Grid
                container
                spacing={4}
                alignContent="center"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="body1" style={{ fontSize: 24 }}>
                    expendas
                  </Typography>
                </Grid>
                <Grid item>
                  <Link href="/planner">Main</Link>
                </Grid>
                <Grid item>
                  <Link href="/payments">Payments</Link>
                </Grid>
                <Grid item>
                  <Link href="/accounts">Accounts</Link>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Button color="light" variant="contained" onClick={signOut}>
                Logout
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <Container style={{ marginTop: 96 }}>
        <Typography variant="h1">{props.title}</Typography>
        {props.children}
      </Container>
    </SignInProvider>
  )
}

const InsideLayout = (props: Props) => (
  <SignInProvider>
    <PaymentProvider>
      <AccountProvider>
        <CycleProvider>
          <Content {...props} />
        </CycleProvider>
      </AccountProvider>
    </PaymentProvider>
  </SignInProvider>
)
export default InsideLayout
