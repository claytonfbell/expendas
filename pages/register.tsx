import { Grid } from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useState } from "react"
import DisplayError from "../src/DisplayError"
import Link from "../src/Link"
import { RegisterRequest } from "../src/model/RegisterRequest"
import rest, { RestError } from "../src/rest"
import StartLayout from "../src/StartLayout"

export default function Home() {
  const [state, setState] = useState<RegisterRequest>({
    email: "",
    firstName: "",
    lastName: "",
    newPassword: "",
  })
  const [error, setError] = useState<RestError>()
  const [isBusy, setIsBusy] = useState(false)

  function handleSubmit() {
    setIsBusy(true)
    setError(undefined)
    rest
      .post("/register", state)
      .catch((e) => setError(e))
      .finally(() => setIsBusy(false))
  }

  return (
    <StartLayout title="Register New Account">
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
            <TextField name="firstName" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="lastName" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="email" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="newPassword" newPassword />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Create New Account</SubmitButton>
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
