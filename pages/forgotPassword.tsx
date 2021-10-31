import { Alert } from "@mui/material"
import { Form } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { useForgotPassword } from "../lib/api/api"
import { ForgotPasswordRequest } from "../lib/api/ForgotPasswordRequest"
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
      {message !== undefined ? (
        <Alert color="success">
          <ReactMarkdown>{message}</ReactMarkdown>
        </Alert>
      ) : null}

      <Form
        error={error?.message}
        busy={isLoading}
        state={state}
        setState={setState}
        onSubmit={handleSubmit}
        submitLabel="Send Link to Setup Password"
        onCancel={() => router.push("/")}
        cancelLabel="Go Back"
        schema={{
          email: "email",
        }}
        layout={{
          submitButton: { xs: 12 },
          cancelButton: { xs: 12 },
        }}
      />
    </Outside>
  )
}
