import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import {
  useFetchOrganization,
  useFetchRetirementPlanUsers,
  useUpdateRetirementPlanUsers,
} from "./api/api"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"
import { useGlobalState } from "./GlobalStateProvider"
import { RetirementPlanSection } from "./RetirementPlanSection"

type StateItem = {
  userId: number
  collectSocialSecurityAge: number
}

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanSocialSecurity({ retirementPlan }: Props) {
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
  }, [state, retirementPlan.id, updateRetirementUsers])

  const totalSocialSecurityPerMonth = useMemo(() => {
    return state.reduce((sum, item) => {
      const ssMonthly = allUsers.find((u) => u.id === item.userId)
        ?.socialSecurityEstimates[
        (state.find((i) => i.userId === item.userId)
          ?.collectSocialSecurityAge ?? 0) - 62
      ]
      return sum + (ssMonthly ?? 0)
    }, 0)
  }, [state, allUsers])

  const totalSocialSecurityPerYear = totalSocialSecurityPerMonth * 12

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <RetirementPlanSection
      title="Social Security"
      summary={
        <Stack>
          {formatMoney(totalSocialSecurityPerMonth, true)} mo /{" "}
          {formatMoney(totalSocialSecurityPerYear, true)} yr
        </Stack>
      }
      collapsible
    >
      <DisplayError error={error} />
      <Table
        size="small"
        sx={{
          "& td, & th": {
            // no left padding on first and right padding on last
            ":first-of-type": {
              paddingLeft: 0,
            },
            ":last-child": {
              paddingRight: 0,
            },
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell
              sx={{
                display: { xs: "none", sm: "table-cell" },
              }}
            >
              Current Age
            </TableCell>
            <TableCell>Age</TableCell>
            <TableCell align="right">Social Security</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allUsers.map((user) => {
            const ssMonthly =
              user.socialSecurityEstimates[
                (state.find((item) => item.userId === user.id)
                  ?.collectSocialSecurityAge ?? 0) - 62
              ]
            const ssYearly = ssMonthly * 12

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <Stack direction={"row"} spacing={0.5} alignItems={"center"}>
                    <Stack>{user.firstName}</Stack>
                    <Stack
                      sx={{
                        display: { xs: "none", sm: "block" },
                      }}
                    >
                      {user.lastName}
                    </Stack>
                  </Stack>
                </TableCell>
                <TableCell
                  sx={{
                    display: { xs: "none", sm: "table-cell" },
                  }}
                >
                  {moment().diff(
                    moment(`${user.dateOfBirth} 00:00:00`),
                    "years"
                  )}
                </TableCell>
                <TableCell>
                  <SelectBase
                    fullWidth
                    options={[62, 63, 64, 65, 66, 67, 68, 69, 70].map(
                      (age) => ({
                        label: age.toString(),
                        value: age,
                      })
                    )}
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
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={0.5}
                    alignItems={{ xs: "end", sm: "center" }}
                    justifyContent={"end"}
                    divider={isMobile ? undefined : <span>/</span>}
                  >
                    <Stack>{formatMoney(ssMonthly, true)} mo</Stack>
                    <Stack>{formatMoney(ssYearly, true)} yr</Stack>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </RetirementPlanSection>
  )
}
