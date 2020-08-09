import { Grid } from "@material-ui/core"
import Button from "material-ui-bootstrap/dist/Button"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import NextLink from "next/link"
import { useRouter } from "next/router"
import React from "react"
import DisplayError from "../src/DisplayError"
import Link from "../src/Link"
import { SignInRequest } from "../src/model/SignInRequest"
import rest, { RestError } from "../src/rest"
import StartLayout from "../src/StartLayout"

export default function Home() {
  const [state, setState] = React.useState<SignInRequest>({
    email: "",
    password: "",
  })
  const [error, setError] = React.useState<RestError>()
  const [isBusy, setIsBusy] = React.useState(false)
  const router = useRouter()

  function handleSubmit() {
    setIsBusy(true)
    setError(undefined)
    rest
      .post("/signIn", state)
      .then(() => {
        router.push("/planner")
      })
      .catch((e) => setError(e))
  }

  React.useEffect(() => {
    rest.get("/signIn")
  }, [])

  return (
    <StartLayout title="Sign In">
      <Form
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
            <TextField name="password" password />
          </Grid>
          <Grid item xs={12}>
            <div style={{ textAlign: "right" }}>
              <NextLink href="/forgotPassword">Forgot Password</NextLink>
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
    </StartLayout>
  )
}
