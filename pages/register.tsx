import { Form } from "material-ui-pack"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useRegister } from "../lib/api/api"
import { RegisterRequest } from "../lib/api/RegisterRequest"
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
        error={error?.message}
        busy={isLoading}
        state={state}
        setState={setState}
        onSubmit={handleSubmit}
        submitLabel="Register"
        onCancel={() => router.push(`/`)}
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
