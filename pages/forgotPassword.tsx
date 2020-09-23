import { Grid } from "@material-ui/core"
import Alert from "material-ui-bootstrap/dist/Alert"
import Button from "material-ui-bootstrap/dist/Button"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import { useState } from "react"
import DisplayError from "../src/DisplayError"
import Link from "../src/Link"
import { ForgotPasswordRequest } from "../src/model/ForgotPasswordRequest"
import rest, { RestError } from "../src/rest"
import StartLayout from "../src/StartLayout"

export default function ForgotPassword() {
  const [state, setState] = useState<ForgotPasswordRequest>({
    email: "",
  })
  const [error, setError] = useState<RestError>()
  const [isBusy, setIsBusy] = useState(false)
  const [sent, setSent] = useState(false)

  function handleSubmit() {
    setIsBusy(true)
    setError(undefined)
    setSent(false)
    rest
      .post("/forgotPassword", state)
      .then(() => setSent(true))
      .catch((e) => setError(e))
      .finally(() => setIsBusy(false))
  }

  return (
    <StartLayout title="Send Reset Code">
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
            {sent && (
              <Alert color="success">
                A reset code has been set to your inbox.
              </Alert>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField name="email" />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Send Reset Code</SubmitButton>
          </Grid>
          <Grid item xs={12}>
            <Button component={Link} href="/" fullWidth variant="outlined">
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Form>
    </StartLayout>
  )
}
