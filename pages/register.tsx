import { Button, Grid } from "@mui/material"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useRegister } from "../lib/api/api"
import { RegisterRequest } from "../lib/api/RegisterRequest"
import DisplayError from "../lib/DisplayError"
import { Outside } from "../lib/Outside"

export default function Register() {
  const [state, setState] = useState<RegisterRequest>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    organization: "",
  })

  const { mutateAsync: register, isLoading, error } = useRegister()

  function handleSubmit() {
    register(state)
  }

  const router = useRouter()

  return (
    <Outside title="Create New Account">
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
            <TextField name="firstName" formatter="capitalize" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="lastName" formatter="capitalize" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="organization"
              label="Your Organization"
              formatter="capitalize"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField name="email" />
          </Grid>
          <Grid item xs={12}>
            <TextField name="password" formatter="newPassword" />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Register</SubmitButton>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push(`/`)}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Outside>
  )
}
