import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core"
import React from "react"
import { useAccount } from "../src/AccountProvider"
import AccountRow from "../src/AccountRow"
import InsideLayout from "../src/InsideLayout"
import { StyledTableRow } from "./planner"

function Accounts() {
  const { fetchAccounts, accounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <StyledTableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell></TableCell>
            <TableCell align="right">Balance</TableCell>
            {/* <TableCell></TableCell> */}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <AccountRow key={account._id} account={account} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default () => (
  <InsideLayout title="Your Accounts">
    <Accounts />
  </InsideLayout>
)
