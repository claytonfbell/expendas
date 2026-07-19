import { Dialog, DialogContent, useMediaQuery, useTheme } from "@mui/material"
import { Account } from "@prisma/client"
import { Form } from "material-ui-pack"
import { useEffect, useState } from "react"
import { debtGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { Title } from "./Title"
import { accountBucketOptions } from "./accountBuckets"
import { accountTypeOptions } from "./accountTypes"
import { useAddAccount } from "./api/hooks/useAddAccount"
import { useUpdateAccount } from "./api/hooks/useUpdateAccount"
import { RestError } from "./api/rest"
import { creditCardTypeOptions } from "./creditCardTypes"

interface Props {
  account: Account | AccountWithIncludes | undefined
  onClose: () => void
}

export function AccountDialog(props: Props) {
  const [error, setError] = useState<RestError>()
  useEffect(() => {
    if (props.account !== undefined) {
      setError(undefined)
    }
  }, [props.account])

  const [state, setState] = useState<
    AccountWithIncludes | Account | undefined
  >()
  useEffect(() => {
    setState(props.account)
  }, [props.account])

  const { mutateAsync: updateAccount, isPending: isUpdating } =
    useUpdateAccount()

  const { mutateAsync: addAccount, isPending: isAdding } = useAddAccount()

  const isNew = state?.id === 0
  const isBusy = isUpdating || isAdding

  function handleSubmit() {
    if (state !== undefined) {
      if (isNew) {
        addAccount(state)
          .then(props.onClose)
          .catch((e) => setError(e))
      } else {
        if ("carryOver" in state) {
          updateAccount(state)
            .then(props.onClose)
            .catch((e) => setError(e))
        }
      }
    }
  }

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("sm"))

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
          buttons
          state={state}
          setState={setState}
          size="small"
          margin="none"
          busy={isBusy}
          onSubmit={handleSubmit}
          onCancel={props.onClose}
          error={error?.message}
          submitLabel={isNew ? "Add Account" : "Save Changes"}
          schema={{
            name: "capitalize",
            accountType: { type: "select", options: accountTypeOptions },
            accountBucket:
              state?.accountType === "Investment"
                ? { type: "select", options: accountBucketOptions }
                : undefined,
            creditCardType:
              state?.accountType === "Credit_Card"
                ? { type: "select", options: creditCardTypeOptions }
                : undefined,
            balance: {
              type: "currency",
              inPennies: true,
              label:
                state?.accountType === "Investment"
                  ? "Current Balance"
                  : undefined,
              allowNegative:
                state !== undefined &&
                debtGroup.types.includes(state.accountType),
            },
          }}
          layout={{}}
        />

        <br />
      </DialogContent>
    </Dialog>
  )
}
