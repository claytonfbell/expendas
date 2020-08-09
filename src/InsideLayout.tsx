import {
  AppBar,
  CssBaseline,
  Grid,
  Paper,
  Toolbar,
  Typography,
} from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Button from "material-ui-bootstrap/dist/Button"
import React from "react"
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
      <AppBar color="default">
        <Toolbar>
          <Grid container justify="space-between">
            <Grid item>
              <Typography variant="body1">expendas</Typography>
            </Grid>
            <Grid item>
              <Button color="danger" variant="outlined" onClick={signOut}>
                Logout
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <Container style={{ marginTop: 96 }}>
        <Paper variant="outlined" style={{ padding: 25 }}>
          <Typography variant="h1">{props.title}</Typography>
          {props.children}
        </Paper>
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
