/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  AppBar,
  Box,
  CssBaseline,
  Grid,
  Hidden,
  Link,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core"
import Container from "@material-ui/core/Container"
import NextLink from "next/link"
import React, { ReactNode } from "react"
import { SignInProvider, useSignIn } from "../SignInProvider"

const useStyles = makeStyles((theme) => ({
  root: {
    "& a": {
      color: "#ffffff",
      cursor: "pointer",
    },
  },
  navLinks: {
    "& a": {
      marginRight: theme.spacing(2),
      display: "inline-block",
    },
  },
  right: {
    textAlign: "right",
  },
}))

interface Props {
  title?: string
  children: ReactNode
}

function Content(props: Props) {
  const { requireAuthentication, signOut } = useSignIn()
  requireAuthentication()
  const classes = useStyles()
  return (
    <SignInProvider>
      <AppBar color="primary" className={classes.root}>
        <Toolbar>
          <Grid container alignContent="center" alignItems="center" spacing={0}>
            <Grid item xs={9}>
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
                  <Box className={classes.navLinks}>
                    <Link component={NextLink} href="/main">
                      Main
                    </Link>
                    <Link component={NextLink} href="/payments">
                      Payments
                    </Link>
                    <Link component={NextLink} href="/accounts">
                      Accounts
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={3} className={classes.right}>
              <Link onClick={signOut}>Logout</Link>
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
    <Content {...props} />
  </SignInProvider>
)
export default InsideLayout
