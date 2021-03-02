import { Grid } from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useRouter } from "next/router"
import queryString from "query-string"
import { useState } from "react"
import DisplayError from "../src/DisplayError"
import Link from "../src/Link"
import { ResetPasswordRequest } from "../src/model/ResetPasswordRequest"
import rest, { RestError } from "../src/rest"
import StartLayout from "../src/StartLayout"

export default function Home() {
  const [state, setState] = useState<ResetPasswordRequest>({
    newPassword: "",
    code: "",
  })
  const [error, setError] = useState<RestError>()
  const [isBusy, setIsBusy] = useState(false)
  const router = useRouter()

  function handleSubmit() {
    setIsBusy(true)
    setError(undefined)
    rest
      .post("/resetPassword", {
        ...state,
        code: queryString.parse(window.location.search).code as string,
      })
      .then(() => router.push("/"))
      .catch((e) => setError(e))
      .finally(() => setIsBusy(false))
  }

  return (
    <StartLayout title="Set Password">
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
            <TextField name="newPassword" newPassword />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Set New Password</SubmitButton>
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
