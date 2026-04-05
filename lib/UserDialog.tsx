import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { User } from "@prisma/client"
import { CurrencyFieldBase, DatePickerBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { useUpdateUser } from "./api/api"
import DisplayError from "./DisplayError"

interface Props {
  organizationId: number
  user: User | null
  onClose: () => void
}

type FormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  socialSecurityEstimates: number[]
}

export function UserDialog({ organizationId, user, onClose }: Props) {
  const { mutateAsync: updateUser, status, error } = useUpdateUser()

  const [state, setState] = useState<FormState>({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
    socialSecurityEstimates: user?.socialSecurityEstimates ?? [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
  })
  useEffect(() => {
    if (user !== null) {
      setState({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
        socialSecurityEstimates: user.socialSecurityEstimates ?? [
          0, 0, 0, 0, 0, 0, 0, 0, 0,
        ],
      })
    }
  }, [user])

  // ensure socialSecurityEstimates is always length 9
  useEffect(() => {
    if (state.socialSecurityEstimates.length < 9) {
      setState((prev) => ({
        ...prev,
        socialSecurityEstimates: [
          ...prev.socialSecurityEstimates,
          ...Array(9 - prev.socialSecurityEstimates.length).fill(0),
        ],
      }))
    } else if (state.socialSecurityEstimates.length > 9) {
      setState((prev) => ({
        ...prev,
        socialSecurityEstimates: prev.socialSecurityEstimates.slice(0, 9),
      }))
    }
  }, [state.socialSecurityEstimates])

  return (
    <Dialog open={user !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{user?.email}</DialogTitle>
      <DialogContent>
        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (user !== null) {
              updateUser({
                user: {
                  ...user,
                  firstName: state.firstName,
                  lastName: state.lastName,
                  dateOfBirth: state.dateOfBirth,
                  socialSecurityEstimates: state.socialSecurityEstimates,
                },
                organizationId,
              }).then(onClose)
            }
          }}
        >
          <Stack spacing={2} marginTop={2}>
            <DisplayError error={error} />
            <Stack direction={"row"} spacing={2}>
              <TextField
                label="First Name"
                value={state.firstName}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
              <TextField
                label="Last Name"
                value={state.lastName}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </Stack>
            <DatePickerBase
              label="Birthday"
              value={state.dateOfBirth === "" ? null : state.dateOfBirth}
              onChange={(dateOfBirth) =>
                setState((prev) => ({
                  ...prev,
                  dateOfBirth: dateOfBirth ?? "",
                }))
              }
            />
            <Stack spacing={2}>
              <div>Social Security Estimates (monthly)</div>
              {state.socialSecurityEstimates.map((estimate, index) => (
                <Stack key={index} alignItems={"start"}>
                  <CurrencyFieldBase
                    currency="USD"
                    fullWidth={false}
                    label={`Age ${62 + index}`}
                    value={Math.round(estimate / 100)}
                    onChange={(value) =>
                      setState((prev) => {
                        const newEstimates = [...prev.socialSecurityEstimates]
                        newEstimates[index] = Math.round(value * 100)
                        return {
                          ...prev,
                          socialSecurityEstimates: newEstimates,
                        }
                      })
                    }
                  />
                </Stack>
              ))}
            </Stack>
            <Button
              type="submit"
              variant="contained"
              disabled={user === null || status === "pending"}
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  )
}
