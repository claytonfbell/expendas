import { Alert } from "@mui/material"
import { Form } from "material-ui-pack"
import { useRouter, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { useForgotPassword } from "../components/api/hooks/useForgotPassword"
import { ForgotPasswordRequestData } from "../components/api/types/ForgotPasswordRequestData"
import { Outside } from "../components/Outside"

export const Route = createFileRoute("/forgotPassword")({
  ssr: false,
  loader: async () => true,
  component: ForgotPassword,
})

function ForgotPassword() {
  const [state, setState] = useState<ForgotPasswordRequestData>({
    email: "",
  })

  const { mutateAsync: forgotPassword, isPending, error } = useForgotPassword()
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
        buttons
        error={error?.message}
        busy={isPending}
        state={state}
        setState={setState}
        onSubmit={handleSubmit}
        submitLabel="Send Link to Setup Password"
        onCancel={() => router.navigate({ to: "/" })}
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
