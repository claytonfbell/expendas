import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableContainer,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import { Button } from "material-ui-bootstrap"
import { useState } from "react"
import { useFetchAccounts } from "../api/accounts"
import { IAccount } from "../db/Account"
import AccountDialog from "../shared/AccountDialog"
import AccountRow from "./AccountRow"

export function AccountsPage() {
  const { data: accounts } = useFetchAccounts()

  const [account, setAccount] = useState<IAccount>()
  function handleAdd() {
    setAccount({
      name: "",
      type: "Checking Account",
      creditCardType: null,
      currentBalance: 0,
      carryOver: [],
      sortBy: 99,
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
        <Table size="small">
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
