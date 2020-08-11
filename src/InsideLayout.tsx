import {
  AppBar,
  CssBaseline,
  Grid,
  Toolbar,
  Typography,
} from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Button from "material-ui-bootstrap/dist/Button"
import React from "react"
import { AccountProvider } from "./AccountProvider"
import { CycleProvider } from "./CycleProvider"
import { PaymentProvider } from "./PaymentProvider"
import { SignInProvider, useSignIn } from "./SignInProvider"

interface Props {
  title: string
  children: React.ReactNode
}

function Content(props: Props) {
  const { requireAuthentication, signOut } = useSignIn()
  requireAuthentication()

  return (
    <SignInProvider>
      <AppBar color="primary">
        <Toolbar>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="body1" style={{ fontSize: 24 }}>
                expendas
              </Typography>
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
