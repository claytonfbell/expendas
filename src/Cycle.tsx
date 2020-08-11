import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import React from "react"
import { formatMoney, StyledTableRow } from "../pages/planner"
import { useCycle } from "./CycleProvider"

interface Props {
  date: string
}
export default function Cycle(props: Props) {
  const { cycle, fetchCycle } = useCycle()
  React.useEffect(() => {
    fetchCycle(props.date)
  }, [fetchCycle, props.date])

  const sum = React.useMemo(
    () => (cycle === null ? 0 : cycle.reduce((acc, x) => acc + x.amount, 0)),
    [cycle]
  )

  return (
    <>
      {cycle && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Transaction</TableCell>
                <TableCell>Account</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cycle.map((p) => (
                <StyledTableRow key={p.id}>
                  <TableCell>{p.paidTo}</TableCell>
                  <TableCell>{p.account.name}</TableCell>
                  <TableCell
                    align="right"
                    style={{
                      fontWeight: p.amount > 0 ? "bold" : undefined,
                      color: p.amount > 0 ? "green" : undefined,
                    }}
                  >
                    {formatMoney(p.amount)}
                  </TableCell>
                </StyledTableRow>
              ))}
              <StyledTableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell
                  align="right"
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: sum ? "green" : "red",
                  }}
                >
                  {formatMoney(sum)}
                </TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}
