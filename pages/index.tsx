import { Grid, Link as MUILink } from "@material-ui/core"
import Button from "material-ui-bootstrap/dist/Button"
import Form from "material-ui-pack/dist/Form"
import useStoredState from "material-ui-pack/dist/hooks/useStoredState"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import DisplayError from "../src/DisplayError"
import Link from "../src/Link"
import { SignInRequest } from "../src/model/SignInRequest"
import rest, { RestError } from "../src/rest"
import { useSignIn } from "../src/SignInProvider"
import StartLayout from "../src/StartLayout"

function SignIn() {
  const [state, setState] = useStoredState<SignInRequest>("expendas-signin", {
    email: "",
    password: "",
  })
  const router = useRouter()

  const [error, setError] = useState<RestError>()
  const { signIn, busy } = useSignIn()
  function handleSubmit() {
    signIn(state)
      .then(() => {
        setState((prev) => ({ ...prev, password: "" }))
        router.push("/main")
      })
      .catch((e) => setError(e))
  }

  useEffect(() => {
    rest.get("/signIn")
  }, [])

  return (
    <Form
      busy={busy}
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
          <TextField name="email" type="email" />
        </Grid>
        <Grid item xs={12}>
          <TextField name="password" password />
        </Grid>
        <Grid item xs={12}>
          <div style={{ textAlign: "right" }}>
            <MUILink component={Link} href="/forgotPassword">
              Forgot Password
            </MUILink>
          </div>
        </Grid>
        <Grid item xs={12}>
          <SubmitButton>Sign In</SubmitButton>
        </Grid>
        <Grid item xs={12}>
          <Button
            component={Link}
            href="/register"
            fullWidth
            variant="outlined"
          >
            Register New Account
          </Button>
        </Grid>
      </Grid>
    </Form>
  )
}

export default () => (
  <StartLayout title="Sign In">
    <SignIn />
  </StartLayout>
)
