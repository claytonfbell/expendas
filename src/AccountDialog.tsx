import { Dialog, DialogContent } from "@material-ui/core"
import Form from "material-ui-pack/dist/Form"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import React from "react"
import { useAccount } from "./AccountProvider"
import { IAccount } from "./db/Account"
import DisplayError from "./DisplayError"
import { RestError } from "./rest"

interface Props {
  account: IAccount
  onClose: () => void
}

export default function AccountDialog(props: Props) {
  const { createAccount, fetchAccounts } = useAccount()
  const [account, setAccount] = React.useState<IAccount>()
  const [error, setError] = React.useState<RestError>()
  React.useEffect(() => {
    setAccount(props.account)
  }, [props.account])

  function handleSubmit() {
    createAccount(account)
      .then(fetchAccounts)
      .catch((e) => setError(e))
  }

  return (
    <Dialog
      open={props.account !== undefined}
      fullWidth
      maxWidth="md"
      onClose={props.onClose}
    >
      {props.account && (
        <DialogContent>
          <Form
            state={account}
            setState={setAccount}
            onSubmit={handleSubmit}
            size="small"
            margin="normal"
          >
            <DisplayError error={error} />
            <TextField name="name" />
            <SubmitButton>Save</SubmitButton>
          </Form>
        </DialogContent>
      )}
    </Dialog>
  )
}
