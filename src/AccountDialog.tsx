import { Dialog, DialogContent, Grid, Typography } from "@material-ui/core"
import Button from "material-ui-bootstrap/dist/Button"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import React from "react"
import { useAccount } from "./AccountProvider"
import { allAccountTypes } from "./accountTypes"
import { IAccount } from "./db/Account"
import DisplayError from "./DisplayError"
import { RestError } from "./rest"

interface Props {
  account: IAccount
  onClose: () => void
}

export default function AccountDialog(props: Props) {
  const { createAccount, updateAccount, fetchAccounts, busy } = useAccount()
  const [account, setAccount] = React.useState<IAccount>()
  const [error, setError] = React.useState<RestError>()
  React.useEffect(() => {
    setError(undefined)
    setAccount(props.account)
  }, [props.account])

  async function handleSubmit() {
    setError(undefined)
    try {
      if (isNew) {
        await createAccount(account)
      } else {
        await updateAccount(account)
      }
    } catch (e) {
      setError(e)
    } finally {
      fetchAccounts()
      props.onClose()
    }
  }

  const isNew = React.useMemo(
    () => account === undefined || account._id === undefined,
    [account]
  )

  return (
    <Dialog
      open={props.account !== undefined}
      fullWidth
      maxWidth="xs"
      onClose={props.onClose}
    >
      {account && (
        <DialogContent>
          <Typography variant="h1">{isNew ? `Create ` : ""}Account</Typography>
          <Form
            busy={busy}
            state={account}
            setState={setAccount}
            onSubmit={handleSubmit}
            size="small"
          >
            <DisplayError error={error} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Select
                  name="type"
                  options={allAccountTypes.map((x) => ({ value: x, label: x }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Select
                  allowNull
                  disabled={account.type !== "Credit Card"}
                  name="creditCardType"
                  options={[
                    "Mastercard",
                    "Visa",
                    "American Express",
                    "Discover",
                  ].map((x) => ({ value: x, label: x }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField name="name" />
              </Grid>
              <Grid item xs={8}>
                <CurrencyField
                  name="currentBalance"
                  inPennies
                  allowNegative
                  fulleWidth
                />
              </Grid>
              <Grid item xs={6}>
                <SubmitButton>{isNew ? "Create" : "Save"}</SubmitButton>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth onClick={props.onClose}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
            <br />
          </Form>
        </DialogContent>
      )}
    </Dialog>
  )
}
