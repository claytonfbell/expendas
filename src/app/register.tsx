import { createFileRoute } from "@tanstack/react-router"
import { Form } from "material-ui-pack"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { useRegister } from "../components/api/api"
import { RegisterRequest } from "../components/api/RegisterRequest"
import { Outside } from "../components/Outside"

export const Route = createFileRoute("/register")({
  ssr: false,
  loader: async () => true,
  component: Register,
})

function Register() {
  const [state, setState] = useState<RegisterRequest>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    organization: "",
  })

  const { mutateAsync: register, isPending, error } = useRegister()

  function handleSubmit() {
    register(state)
  }

  const router = useRouter()

  return (
    <Outside title="Create New Account">
      <Form
        buttons
        error={error?.message}
        busy={isPending}
        state={state}
        setState={setState}
        onSubmit={handleSubmit}
        submitLabel="Register"
        onCancel={() => router.navigate({ to: "/" })}
        schema={{
          firstName: "capitalize",
          lastName: "capitalize",
          organization: { type: "capitalize", label: "Your Organization" },
          email: "email",
          password: "newPassword",
        }}
      />
    </Outside>
  )
}
