import { createFileRoute } from "@tanstack/react-router"
import { Alert } from "@mui/material"
import { Form } from "material-ui-pack"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useResetPassword } from "../../lib/api/api"
import { ResetPasswordRequest } from "../../lib/api/ResetPasswordRequest"
import { Outside } from "../../lib/Outside"

export const Route = createFileRoute("/setPassword")({
  ssr: false,
  loader: async () => true,
  component: SetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    authCode: (search.authCode as string) || "",
  }),
})

function SetPassword() {
  const { authCode } = Route.useSearch()
  const router = Route.useRouter()
  const [state, setState] = useState<ResetPasswordRequest>({
    password: "",
    authCode: "",
  })

  useEffect(() => {
    if (authCode) {
      setState((prev) => ({ ...prev, authCode }))
    }
  }, [authCode])

  const { mutateAsync: resetPassword, isPending, error } = useResetPassword()
  const [message, setMessage] = useState<string>()

  function handleSubmit() {
    resetPassword(state).then(() => router.navigate({ to: "/" }))
  }

  return (
    <Outside title="Set Password">
      {message !== undefined ? (
        <Alert color="success">
          <ReactMarkdown>{message}</ReactMarkdown>
        </Alert>
      ) : null}
      <Form
        buttons
        error={error?.message}
        busy={isPending}
        state={state}
        setState={setState}
        onSubmit={handleSubmit}
        submitLabel="Set Password"
        onCancel={() => router.navigate({ to: "/" })}
        schema={{
          authCode: { type: "text", label: "Reset Code" },
          password: { type: "newPassword", label: "New Password" },
        }}
      />
    </Outside>
  )
}
