import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
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
  const [collapsed, setCollapsed] = useState(!isMobile)

  return (
    <Stack spacing={1}>
      <Stack
        paddingLeft={2}
        direction={{ xs: "column", sm: "row" }}
        alignItems={"baseline"}
        spacing={2}
      >
        <Typography variant="h4">Social Security</Typography>
        <Stack>
          {formatMoney(totalSocialSecurityPerMonth, true)} mo /{" "}
          {formatMoney(totalSocialSecurityPerYear, true)} yr
        </Stack>
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            display: { xs: "none", sm: "block" },
          }}
        >
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Stack>
      <DisplayError error={error} />
      <Collapse in={!collapsed} unmountOnExit>
        <TableContainer>
          <Table>
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
                      <Stack
                        direction={"row"}
                        spacing={0.5}
                        alignItems={"center"}
                      >
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
        </TableContainer>
      </Collapse>
    </Stack>
  )
}
