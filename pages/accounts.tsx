import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import Button from "material-ui-bootstrap/dist/Button"
import React from "react"
import AccountDialog from "../src/AccountDialog"
import { useAccount } from "../src/AccountProvider"
import AccountRow from "../src/AccountRow"
import { IAccount } from "../src/db/Account"
import InsideLayout from "../src/InsideLayout"
import { StyledTableRow } from "./planner"

function Accounts() {
  const { fetchAccounts, accounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const [account, setAccount] = React.useState<IAccount>()
  function handleAdd() {
    setAccount({
      name: "",
      type: "Checking Account",
      creditCardType: null,
      currentBalance: 0,
    })
  }

  return (
    <>
      <Grid container justify="flex-end" spacing={4}>
        <Grid item>
          <Button startIcon={<AddIcon />} onClick={handleAdd}>
            Add Account
          </Button>
        </Grid>
      </Grid>
      <br />
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

      <AccountDialog account={account} onClose={() => setAccount(undefined)} />
    </>
  )
}

export default () => (
  <InsideLayout title="Your Accounts">
    <Accounts />
  </InsideLayout>
)
