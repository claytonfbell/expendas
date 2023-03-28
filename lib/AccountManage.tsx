import { Button } from "@mui/material"
import { Account } from "@prisma/client"
import { ResponsiveTable } from "material-ui-pack"
import { useEffect, useState } from "react"
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

  const [asc, setAsc] = useState(true)
  useEffect(() => {
    console.log(asc)
  }, [asc])

  return (
    <>
      <DisplayError error={error} />

      <ResponsiveTable
        striped
        size="small"
        elevation={4}
        onEdit={(account) => setAccountToUpdate(account)}
        onDelete={(account) => setAccountToRemove(account)}
        rowData={(data || []).sort(
          (a, b) => Math.abs(b.balance) - Math.abs(a.balance)
        )}
        schema={[
          {
            label: "Account",
            render: (account) =>
              `${account.name} ${
                account.accountType === "Credit_Card" &&
                account.creditCardType !== null
                  ? displayCreditCardType(account.creditCardType)
                  : displayAccountType(account.accountType)
              }`,
          },
          {
            label: "Balance / Value",
            alignRight: true,
            render: function render(account) {
              return <Currency value={account.balance} red />
            },
          },
        ]}
      />

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
            totalDeposits: 0,
            totalFixedIncome: 0,
            accountBucket: "After_Tax",
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
