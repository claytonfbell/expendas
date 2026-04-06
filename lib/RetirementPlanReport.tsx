import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { useFetchRetirementPlanReport } from "./api/api"
import { formatMoney } from "./formatMoney"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanReport({ retirementPlan }: Props) {
  const { data: projectionRows } = useFetchRetirementPlanReport(
    retirementPlan.id
  )

  return (
    <Stack spacing={1} alignItems={"start"}>
      {projectionRows !== undefined && (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
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
                    <TableCell>{row.date}</TableCell>
                    <TableCell>
                      {formatMoney(row.startingBalance, true)}
                    </TableCell>
                    <TableCell>{formatMoney(row.appreciation, true)}</TableCell>
                    <TableCell>{formatMoney(row.dividend, true)}</TableCell>
                    <TableCell>{formatMoney(row.contribution, true)}</TableCell>
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
