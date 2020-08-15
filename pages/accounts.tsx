import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import Button from "material-ui-bootstrap/dist/Button"
import React from "react"
import AccountDialog from "../src/AccountDialog"
import { useAccount } from "../src/AccountProvider"
import AccountRow from "../src/AccountRow"
import { IAccount } from "../src/db/Account"
import InsideLayout from "../src/InsideLayout"

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
      carryOver: [],
    })
  }

  function handleEdit(account: IAccount) {
    setAccount(account)
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
          <TableBody>
            {accounts.map((account) => (
              <AccountRow
                key={account._id}
                account={account}
                onEdit={handleEdit}
              />
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
