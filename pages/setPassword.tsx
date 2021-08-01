import { Grid } from "@material-ui/core"
import { Alert, Button } from "material-ui-bootstrap"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useResetPassword } from "../lib/api/api"
import { ResetPasswordRequest } from "../lib/api/ResetPasswordRequest"
import DisplayError from "../lib/DisplayError"
import { Outside } from "../lib/Outside"

export default function ResetPassword() {
  const router = useRouter()
  const [state, setState] = useState<ResetPasswordRequest>({
    password: "",
    authCode: "",
  })
  const authCode = router.query.authCode as string | undefined

  useEffect(() => {
    if (authCode !== undefined) {
      setState((prev) => ({ ...prev, authCode }))
    }
  }, [authCode])

  const { mutateAsync: resetPassword, isLoading, error } = useResetPassword()
  const [message, setMessage] = useState<string>()

  function handleSubmit() {
    resetPassword(state).then(() => router.push("/"))
  }

  return (
    <Outside title="Set Password">
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
            <TextField name="authCode" label="Reset Code" />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="password"
              formatter="newPassword"
              label="New Password"
            />
          </Grid>
          <Grid item xs={12}>
            <SubmitButton>Set Password</SubmitButton>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Outside>
  )
}
