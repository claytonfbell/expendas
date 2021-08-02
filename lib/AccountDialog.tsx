import {
  Dialog,
  DialogContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { Account } from "@prisma/client"
import { Button } from "material-ui-bootstrap"
import {
  CurrencyField,
  Form,
  Select,
  SubmitButton,
  TextField,
} from "material-ui-pack"
import React, { useEffect, useState } from "react"
import { accountTypeOptions } from "./accountTypes"
import { useAddAccount, useUpdateAccount } from "./api/api"
import DisplayError from "./DisplayError"
import { Title } from "./Title"

interface Props {
  account: Account | undefined
  onClose: () => void
}

export function AccountDialog(props: Props) {
  const [state, setState] = useState<Account | undefined>()
  useEffect(() => {
    setState(props.account)
  }, [props.account])

  const {
    mutateAsync: updateAccount,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateAccount()

  const {
    mutateAsync: addAccount,
    isLoading: isAdding,
    error: accountError,
  } = useAddAccount()

  const isNew = state?.id === 0
  const isBusy = isUpdating || isAdding
  const error = updateError || accountError

  function handleSubmit() {
    if (state !== undefined) {
      if (isNew) {
        addAccount(state).then(props.onClose)
      } else {
        updateAccount(state).then(props.onClose)
      }
    }
  }

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Dialog
      open={state !== undefined}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        <Title label={isNew ? "Add New Account" : "Update Account"} />
        <Form
          state={state}
          setState={setState}
          size="small"
          margin="none"
          busy={isBusy}
          onSubmit={handleSubmit}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DisplayError error={error} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="name" formatter="capitalize" />
            </Grid>
            <Grid item xs={12}>
              <Select name="accountType" options={accountTypeOptions} />
            </Grid>
            <Grid item xs={12}>
              <CurrencyField name="balance" inPennies numeric fullWidth />
            </Grid>
            <Grid item xs={6}>
              <SubmitButton>
                {isNew ? "Add Account" : "Save Changes"}
              </SubmitButton>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth variant="outlined" onClick={props.onClose}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Form>
        <br />
      </DialogContent>
    </Dialog>
  )
}
