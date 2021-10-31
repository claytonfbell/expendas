import { Box } from "@mui/material"
import { Form, TextField } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useLogin } from "./api/api"
import { LoginRequest } from "./api/LoginRequest"
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
      error={error?.message}
      busy={isLoading}
      state={state}
      setState={setState}
      onSubmit={handleSubmit}
      submitLabel="Login"
      onCancel={() => router.push("/register")}
      cancelLabel="Create New Account"
      schema={{
        email: "email",
        password: () => (
          <>
            <TextField name="password" formatter="password" />
            <Box style={{ textAlign: "right" }} marginTop={1}>
              <Link href="/forgotPassword">Forgot Password</Link>
            </Box>
          </>
        ),
      }}
      layout={{
        submitButton: { xs: 12 },
        cancelButton: { xs: 12 },
      }}
    />
  )
}
