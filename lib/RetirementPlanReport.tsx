import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import moment from "moment"
import {
  useFetchRetirementPlanReport,
  useFetchRetirementPlanUsers,
} from "./api/api"
import { formatMoney } from "./formatMoney"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanReport({ retirementPlan }: Props) {
  const { data: projectionRows } = useFetchRetirementPlanReport(
    retirementPlan.id
  )

  const { data: users } = useFetchRetirementPlanUsers(retirementPlan.id)

  return (
    <Stack spacing={1} alignItems={"start"}>
      {projectionRows !== undefined && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Ages</TableCell>
                  <TableCell>Starting Balance</TableCell>
                  <TableCell>Appreciation</TableCell>
                  <TableCell>Dividend</TableCell>
                  <TableCell>Contribution</TableCell>
                  <TableCell>Ending Balance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectionRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>
                      {moment(`${row.date} 00:00:00`).year()}
                    </TableCell>
                    <TableCell>
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
                    <TableCell>
                      {formatMoney(row.startingBalance, true)}
                    </TableCell>
                    <TableCell>{formatMoney(row.appreciation, true)}</TableCell>
                    <TableCell>{formatMoney(row.dividend, true)}</TableCell>
                    <TableCell>
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
                    <TableCell>
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
