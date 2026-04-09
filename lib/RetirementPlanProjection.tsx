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
import moment, { Moment } from "moment"
import { useMemo } from "react"
import AnimatedCounter from "./AnimatedCounter"
import {
  useFetchAccounts,
  useFetchRetirementPlanReport,
  useFetchRetirementPlanUsers,
} from "./api/api"
import { BottomStatusBar } from "./BottomStatusBar"
import { formatMoney } from "./formatMoney"
import { NoBr } from "./NoBr"
import { RetirementPlanSection } from "./RetirementPlanSection"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanProjection({ retirementPlan }: Props) {
  const { data: report } = useFetchRetirementPlanReport(retirementPlan.id)

  const { data: users } = useFetchRetirementPlanUsers(retirementPlan.id)

  const fiDate = moment(report?.fiDate?.date)
  const fiFromNowString = fromNow(fiDate)
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

  const millionaireDate = moment(report?.millionaireDate?.date)
  const millionaireFromNowString = fromNow(millionaireDate)

  return (
    <>
      <RetirementPlanSection
        title="Projection"
        summary={
          <>
            <Stack>
              {formatMoney(report?.fiDate.endingBalance ?? 0, true)}
            </Stack>
            <Stack>{fiDate.format("MMMM, YYYY")}</Stack>
            <Stack>{fiFromNowString}</Stack>
            <Stack>Ages: {agesString}</Stack>
            <Stack>Millionaire : {millionaireFromNowString}</Stack>
          </>
        }
      >
        {report !== undefined && (
          <Stack spacing={2}>
            <Box position={"relative"}>
              <LinearProgress
                color="primary"
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
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                {Math.round(
                  (savedSoFar / (report?.fiDate.endingBalance ?? 1)) * 100
                )}
                %
              </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
              <TableContainer>
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
                    {report.projectionRows.map((row) => {
                      const startDate = moment(`${row.date} 00:00:00`)
                      const endDate = moment(`${row.date} 00:00:00`).add(
                        1,
                        "year"
                      )
                      const hilighted = fiDate.isBetween(
                        startDate,
                        endDate,
                        "day",
                        "[]"
                      )

                      return (
                        <TableRow key={row.date} selected={hilighted}>
                          <TableCell>
                            {moment(`${row.date} 00:00:00`).year()}
                          </TableCell>
                          <TableCell align="center">
                            <NoBr>
                              {users
                                ? users
                                    .map((user) => {
                                      return moment(
                                        `${row.date} 00:00:00`
                                      ).diff(
                                        moment(
                                          `${user.user.dateOfBirth} 00:00:00`
                                        ),
                                        "years"
                                      )
                                    })
                                    .join(" / ")
                                : ""}
                            </NoBr>
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
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        )}
      </RetirementPlanSection>

      <BottomStatusBar>
        <Stack direction="row" spacing={4} justifyContent="end">
          <Stack alignItems={"end"}>
            <Typography>{fiFromNowString}</Typography>
            <Stack>{fiDate.format("MMMM, YYYY")}</Stack>
          </Stack>
          <Stack alignItems={"end"}>
            <Typography>Financial Independence</Typography>
            <AnimatedCounter
              value={report?.fiDate.endingBalance ?? 0}
              roundNearestDollar
            />
          </Stack>
        </Stack>
      </BottomStatusBar>
    </>
  )
}

function fromNow(target: Moment) {
  const now = moment()
  const years = target.diff(now, "years")
  const months = target.diff(now, "months") % 12
  if (years >= 1) {
    return `${years} years, ${months} months`
  } else if (months >= 1) {
    return `${months} months`
  }
  return ""
}
