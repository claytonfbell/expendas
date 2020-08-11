import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import React from "react"
import { useAccount } from "../src/AccountProvider"
import InsideLayout from "../src/InsideLayout"
import { IAccount } from "../src/model/Account"
import { StyledTableRow } from "./planner"

interface FormState {
  accounts: IAccount[]
}

function Accounts() {
  const { fetchAccounts, accounts, busy, updateAccount } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  React.useEffect(() => {
    setState({ accounts })
  }, [accounts])

  const [state, setState] = React.useState<FormState>({
    accounts: [],
  })

  async function handleSubmit() {
    for (let i = 0; i < state.accounts.length; i++) {
      await updateAccount(state.accounts[i])
    }
    fetchAccounts()
  }

  return (
    <Form
      size="small"
      state={state}
      setState={setState}
      busy={busy}
      onSubmit={handleSubmit}
    >
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
            {accounts.map((account, i) => (
              <StyledTableRow key={account._id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>{account.creditCardType}</TableCell>
                <TableCell align="right" style={{ maxWidth: 80 }}>
                  <CurrencyField
                    name={`accounts[${i}].currentBalance`}
                    label=""
                    allowNegative
                  />
                </TableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="right" style={{ maxWidth: 80 }}>
                <SubmitButton>Save</SubmitButton>
              </TableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Form>
  )
}

export default () => (
  <InsideLayout title="Your Accounts">
    <Accounts />
  </InsideLayout>
)
