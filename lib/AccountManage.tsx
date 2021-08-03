import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import EditIcon from "@material-ui/icons/Edit"
import { Account } from "@prisma/client"
import { Button } from "material-ui-bootstrap"
import React, { useState } from "react"
import { AccountDialog } from "./AccountDialog"
import { displayAccountType } from "./accountTypes"
import { useFetchAccounts, useRemoveAccount } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import { displayCreditCardType } from "./creditCardTypes"
import { Currency } from "./Currency"
import DisplayError from "./DisplayError"
import { useGlobalState } from "./GlobalStateProvider"

export function AccountManage() {
  const { organizationId } = useGlobalState()
  const { data, error: fetchError } = useFetchAccounts()

  const { mutateAsync: removeAccount, error: removeError } = useRemoveAccount()
  const [accountToRemove, setAccountToRemove] = useState<Account>()
  const [accountToUpdate, setAccountToUpdate] = useState<Account>()
  function handleDelete() {
    if (accountToRemove !== undefined) {
      removeAccount(accountToRemove)
      setAccountToRemove(undefined)
    }
  }

  const error = fetchError || removeError

  return (
    <>
      <DisplayError error={error} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data || []).map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  {account.accountType === "Credit_Card" &&
                  account.creditCardType !== null
                    ? displayCreditCardType(account.creditCardType)
                    : displayAccountType(account.accountType)}
                </TableCell>
                <TableCell>
                  <Currency value={account.balance} red />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => setAccountToUpdate(account)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => setAccountToRemove(account)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <br />
      <br />
      <Button
        onClick={() =>
          setAccountToUpdate({
            id: 0,
            organizationId: organizationId || 0,
            name: "",
            accountType: "Checking_Account",
            balance: 0,
            creditCardType: null,
          })
        }
      >
        Add Account
      </Button>
      <AccountDialog
        account={accountToUpdate}
        onClose={() => setAccountToUpdate(undefined)}
      />

      <ConfirmDialog
        open={accountToRemove !== undefined}
        onClose={() => setAccountToRemove(undefined)}
        onAccept={handleDelete}
        message="Are you sure you want to delete account?"
      />
    </>
  )
}
