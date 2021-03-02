import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import {
  CurrencyField,
  Form,
  Select,
  SubmitButton,
  TextField,
} from "material-ui-pack"
import React, { useEffect, useMemo, useState } from "react"
import { allAccountTypes, creditCardTypes } from "../accountTypes"
import {
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "../api/accounts"
import { IAccount } from "../db/Account"
import DisplayError from "../DisplayError"
import { RestError } from "../rest"

interface Props {
  account: IAccount
  onClose: () => void
}

export default function AccountDialog(props: Props) {
  const [createAccount, { isLoading: isCreatingAccount }] = useCreateAccount()
  const [updateAccount, { isLoading: isUpdatingAccount }] = useUpdateAccount()
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccount()

  const isBusy = isCreatingAccount || isUpdatingAccount || isDeleting

  const [account, setAccount] = useState<IAccount>()
  const [error, setError] = useState<RestError>()
  useEffect(() => {
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
      props.onClose()
    }
  }

  const isNew = useMemo(
    () => account === undefined || account._id === undefined,
    [account]
  )

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  function handleDelete() {
    deleteAccount(props.account).then(() => {
      props.onClose()
    })
  }

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
            busy={isBusy}
            state={account}
            setState={setAccount}
            onSubmit={handleSubmit}
            size="small"
          >
            <DisplayError error={error} />
            <Grid container spacing={1}>
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
                  options={creditCardTypes.map((x) => ({ value: x, label: x }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField name="name" />
              </Grid>
              <Grid item xs={9}>
                <CurrencyField
                  name="currentBalance"
                  inPennies
                  allowNegative
                  fulleWidth
                />
              </Grid>
              <Grid item xs={isNew ? 6 : 4}>
                <SubmitButton>{isNew ? "Create" : "Save"}</SubmitButton>
              </Grid>
              <Grid item xs={isNew ? 6 : 4}>
                <Button variant="outlined" fullWidth onClick={props.onClose}>
                  Cancel
                </Button>
              </Grid>
              {!isNew ? (
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                </Grid>
              ) : null}
            </Grid>
            <br />
          </Form>

          <Dialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
          >
            <DialogContent>
              Are you sure you want to remove account?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDelete}>Yes</Button>
              <Button onClick={() => setShowDeleteConfirm(false)}>No</Button>
            </DialogActions>
          </Dialog>
        </DialogContent>
      )}
    </Dialog>
  )
}
