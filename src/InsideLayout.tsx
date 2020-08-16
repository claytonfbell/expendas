/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  AppBar,
  CssBaseline,
  Grid,
  Hidden,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core"
import Container from "@material-ui/core/Container"
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
  title?: string
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
          <Grid
            container
            justify="space-between"
            alignContent="center"
            alignItems="center"
            spacing={0}
          >
            <Grid item>
              <Grid
                container
                spacing={3}
                alignContent="center"
                alignItems="center"
              >
                <Hidden xsDown>
                  <Grid item>
                    <Typography variant="body1" style={{ fontSize: 24 }}>
                      expendas
                    </Typography>
                  </Grid>
                </Hidden>
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
              <a href="javascript:;" onClick={signOut}>
                Logout
              </a>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <Container style={{ marginTop: 96, marginBottom: 64 }}>
        {props.title && <Typography variant="h1">{props.title}</Typography>}
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
