import { Stack, Typography } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import { useEffect, useMemo, useState } from "react"
import {
  useFetchOrganization,
  useFetchRetirementPlanUsers,
  useUpdateRetirementPlanUsers,
} from "./api/api"
import DisplayError from "./DisplayError"
import { useGlobalState } from "./GlobalStateProvider"

type StateItem = {
  userId: number
  collectSocialSecurityAge: number
}

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanUsers({ retirementPlan }: Props) {
  const { data: planUsers } = useFetchRetirementPlanUsers(retirementPlan.id)
  const { organizationId } = useGlobalState()
  const { data: organization } = useFetchOrganization(organizationId)
  const allUsers = useMemo(() => {
    if (organization === undefined) return []
    return organization.users.map((x) => x.user)
  }, [organization])

  const [state, setState] = useState<StateItem[]>([])

  useEffect(() => {
    if (planUsers !== undefined) {
      const newState: StateItem[] = []
      allUsers.forEach((user) => {
        const planUser = planUsers.find((c) => c.userId === user.id)
        newState.push({
          userId: user.id,
          collectSocialSecurityAge: planUser?.collectSocialSecurityAge ?? 0,
        })
      })
      setState(newState)
    }
  }, [planUsers, allUsers])

  const {
    mutateAsync: updateRetirementUsers,
    status,
    error,
  } = useUpdateRetirementPlanUsers()

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateRetirementUsers({
        retirementPlanId: retirementPlan.id,
        users: state.map((item) => ({
          userId: item.userId,
          collectSocialSecurityAge: item.collectSocialSecurityAge,
        })),
      })
    }, 1000)

    return () => clearTimeout(timeout)
  }, [state, retirementPlan.id])

  return (
    <Stack spacing={1} alignItems={"start"}>
      <Typography variant="h4">Ages to Collect Social Security</Typography>
      <DisplayError error={error} />
      {allUsers.map((user) => {
        return (
          <Stack
            key={user.id}
            direction={"row"}
            spacing={2}
            alignItems={"center"}
            sx={{
              width: 220,
            }}
          >
            <SelectBase
              options={[62, 63, 64, 65, 66, 67, 68, 69, 70].map((age) => ({
                label: age.toString(),
                value: age,
              }))}
              size="small"
              value={
                state.find((item) => item.userId === user.id)
                  ?.collectSocialSecurityAge ?? 0
              }
              onChange={(x) => {
                setState((prev) => {
                  const newState = [...prev]
                  const index = newState.findIndex(
                    (item) => item.userId === user.id
                  )
                  if (index !== -1) {
                    newState[index] = {
                      userId: user.id,
                      collectSocialSecurityAge: x as number,
                    }
                  } else {
                    newState.push({
                      userId: user.id,
                      collectSocialSecurityAge: x as number,
                    })
                  }
                  return newState
                })
              }}
            />
            <div>
              {user.firstName} {user.lastName}
            </div>
          </Stack>
        )
      })}
    </Stack>
  )
}
