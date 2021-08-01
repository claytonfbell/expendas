import { Box, Grid } from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useLogin } from "./api/api"
import { LoginRequest } from "./api/LoginRequest"
import DisplayError from "./DisplayError"
import { Link } from "./Link"

export function Login() {
  const [state, setState] = useState<LoginRequest>({
    email: "",
    password: "",
  })

  const { mutateAsync: login, isLoading, error } = useLogin()

  function handleSubmit() {
    login(state)
  }

  const router = useRouter()

  return (
    <Form
      state={state}
      setState={setState}
      onSubmit={handleSubmit}
      busy={isLoading}
      size="small"
      margin="none"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DisplayError error={error} />
        </Grid>
        <Grid item xs={12}>
          <TextField name="email" />
        </Grid>
        <Grid item xs={12}>
          <TextField name="password" formatter="password" />
          <Box style={{ textAlign: "right" }} marginTop={1}>
            <Link href="/forgotPassword">Forgot Password</Link>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <SubmitButton>Login</SubmitButton>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push("/register")}
          >
            Create New Account
          </Button>
        </Grid>
      </Grid>
    </Form>
  )
}
