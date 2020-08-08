import { CssBaseline, Grid, Typography } from "@material-ui/core"
import Container from "@material-ui/core/Container"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import React from "react"
import DisplayError from "../src/DisplayError"
import { ForgotPasswordRequest } from "../src/model/ForgotPasswordRequest"
import rest, { RestError } from "../src/rest"

export default function ForgotPassword() {
  const [state, setState] = React.useState<ForgotPasswordRequest>({
    email: "",
  })
  const [error, setError] = React.useState<RestError>()
  const [isBusy, setIsBusy] = React.useState(false)

  function handleSubmit() {
    setIsBusy(true)
    setError(undefined)
    rest
      .post("/forgotPassword", state)
      .catch((e) => setError(e))
      .finally(() => setIsBusy(false))
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="xs">
        <Typography variant="h1">Sign In</Typography>
        <Form
          busy={isBusy}
          state={state}
          setState={setState}
          size="small"
          onSubmit={handleSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DisplayError error={error} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="email" />
            </Grid>
            <Grid item xs={12}>
              <SubmitButton>Send Reset Code</SubmitButton>
            </Grid>
          </Grid>
        </Form>
      </Container>
    </>
  )
}
