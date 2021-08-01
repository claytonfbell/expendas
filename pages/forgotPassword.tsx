import { Grid } from "@material-ui/core"
import { Alert, Button } from "material-ui-bootstrap"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { useForgotPassword } from "../lib/api/api"
import { ForgotPasswordRequest } from "../lib/api/ForgotPasswordRequest"
import DisplayError from "../lib/DisplayError"
import { Outside } from "../lib/Outside"

export default function ForgotPassword() {
  const [state, setState] = useState<ForgotPasswordRequest>({
    email: "",
  })

  const { mutateAsync: forgotPassword, isLoading, error } = useForgotPassword()
  const [message, setMessage] = useState<string>()

  function handleSubmit() {
    forgotPassword(state).then((data) => setMessage(data?.message))
  }

  const router = useRouter()

  return (
    <Outside title="Forgot Password">
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
            {message !== undefined ? (
              <Alert color="success">
                <ReactMarkdown>{message}</ReactMarkdown>
              </Alert>
            ) : null}
          </Grid>
          <Grid item xs={12}>
            <TextField name="email" />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Send Link to Setup Password</SubmitButton>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/")}
            >
              Go Back
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Outside>
  )
}
