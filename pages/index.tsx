import { CssBaseline, Grid, Typography } from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import React from "react"
import DisplayError from "../src/DisplayError"
import rest, { RestError } from "../src/rest"

export default function Home() {
  const [state, setState] = React.useState({
    username: "",
    password: "",
  })
  const [error, setError] = React.useState<RestError>()

  function handleSubmit() {
    rest.post("/signIn", state).catch((e) => setError(e))
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="xs">
        <Typography variant="h1">Sign In</Typography>
        <Form
          state={state}
          setState={setState}
          debug
          size="small"
          onSubmit={handleSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DisplayError error={error} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="username" />
            </Grid>
            <Grid item xs={12}>
              <TextField name="password" password />
            </Grid>
            <Grid item xs={12}>
              <SubmitButton>Sign In</SubmitButton>
            </Grid>
          </Grid>
        </Form>
      </Container>
    </>
  )
}
