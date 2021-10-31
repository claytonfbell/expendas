import { Alert } from "@mui/material"
import { Form } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useResetPassword } from "../lib/api/api"
import { ResetPasswordRequest } from "../lib/api/ResetPasswordRequest"
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
        submitLabel="Set Password"
        onCancel={() => router.push("/")}
        schema={{
          authCode: { type: "text", label: "Reset Code" },
          password: { type: "newPassword", label: "New Password" },
        }}
      />
    </Outside>
  )
}
