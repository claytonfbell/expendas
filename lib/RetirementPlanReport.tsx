import {
  Box,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import moment from "moment"
import { useMemo } from "react"
import {
  useFetchAccounts,
  useFetchRetirementPlanReport,
  useFetchRetirementPlanUsers,
} from "./api/api"
import { formatMoney } from "./formatMoney"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanReport({ retirementPlan }: Props) {
  const { data: report } = useFetchRetirementPlanReport(retirementPlan.id)

  const { data: users } = useFetchRetirementPlanUsers(retirementPlan.id)

  const fiDate = moment(report?.fiDate?.date)
  // fromNow in years and months
  const fiFromNowYears = fiDate.diff(moment(), "years")
  const fiFromNowMonths = fiDate.diff(moment(), "months") % 12
  const fromNowString = `${fiFromNowYears} years, ${fiFromNowMonths} months`
  const agesString = useMemo(
    () =>
      users
        ? users
            .map((user) =>
              moment(fiDate).diff(
                moment(`${user.user.dateOfBirth} 00:00:00`),
                "years"
              )
            )
            .join(" / ")
        : "",
    [users, fiDate]
  )

  const { data: accounts } = useFetchAccounts()
  const retirementAccounts = useMemo(
    () =>
      accounts
        ?.filter((x) => x.accountType === "Investment")
        .sort((a, b) =>
          a.accountBucket && b.accountBucket
            ? a.accountBucket.localeCompare(b.accountBucket)
            : 0
        ) ?? [],
    [accounts]
  )
  const savedSoFar = useMemo(() => {
    return retirementAccounts.reduce((sum, account) => {
      return sum + account.balance
    }, 0)
  }, [retirementAccounts])

  return (
    <Stack spacing={2} alignItems={"start"}>
      <Stack
        direction={"row"}
        alignItems={"baseline"}
        spacing={3}
        paddingLeft={2}
      >
        <Typography variant="h4">Projection</Typography>
        <Stack>{formatMoney(report?.fiDate.endingBalance ?? 0, true)}</Stack>
        <Stack>
          {fiDate.format("MMMM, YYYY")} ({fromNowString})
        </Stack>
        <Stack>Ages: {agesString}</Stack>
      </Stack>
      <Stack width={"100%"}>
        <Box position={"relative"}>
          <LinearProgress
            value={(savedSoFar / (report?.fiDate.endingBalance ?? 1)) * 100}
            variant="determinate"
            sx={{
              height: 24,
              borderRadius: 20,
            }}
          />
          <Box
            position="absolute"
            left="50%"
            top={0}
            sx={{
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            {Math.round(
              (savedSoFar / (report?.fiDate.endingBalance ?? 1)) * 100
            )}
            %
          </Box>
        </Box>
      </Stack>

      {report !== undefined && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell align="center">Ages</TableCell>
                  <TableCell align="right">Starting Balance</TableCell>
                  <TableCell align="right">Appreciation</TableCell>
                  <TableCell align="right">Dividend</TableCell>
                  <TableCell align="right">+ / -</TableCell>
                  <TableCell align="right">Ending Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.projectionRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>
                      {moment(`${row.date} 00:00:00`).year()}
                    </TableCell>
                    <TableCell align="center">
                      {users
                        ? users
                            .map((user) => {
                              return moment(`${row.date} 00:00:00`).diff(
                                moment(`${user.user.dateOfBirth} 00:00:00`),
                                "years"
                              )
                            })
                            .join(" / ")
                        : ""}
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(row.startingBalance, true)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(row.appreciation, true)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(row.dividend, true)}
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          color: (theme) =>
                            row.contribution < 0
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                        }}
                      >
                        {formatMoney(row.contribution, true)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatMoney(row.endingBalance, true)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  )
}
