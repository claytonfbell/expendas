import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Account } from "@prisma/client"
import { Form } from "material-ui-pack"
import { useEffect, useState } from "react"
import { debtGroup, investmentGroup } from "./AccountGroup"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { Currency } from "./Currency"
import { Title } from "./Title"
import { accountBucketOptions } from "./accountBuckets"
import { accountTypeOptions } from "./accountTypes"
import { useAddAccount, useUpdateAccount } from "./api/api"
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

  const { mutateAsync: updateAccount, isLoading: isUpdating } =
    useUpdateAccount()

  const { mutateAsync: addAccount, isLoading: isAdding } = useAddAccount()

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
              numeric: true,
              label:
                state?.accountType === "Investment"
                  ? "Current Balance"
                  : undefined,
              allowNegative:
                state !== undefined &&
                debtGroup.types.includes(state.accountType),
            },

            ...(state?.accountType !== undefined &&
            investmentGroup.types.includes(state?.accountType)
              ? {
                  totalFixedIncome: {
                    type: "currency",
                    inPennies: true,
                    numeric: true,
                    fullWidth: true,
                  },
                }
              : {}),
          }}
          layout={{
            totalFixedIncome:
              state === undefined
                ? undefined
                : {
                    xs: 12,
                    renderAfter: (
                      <Grid item xs={12}>
                        <Box paddingLeft={2} paddingRight={2} paddingBottom={2}>
                          <Grid
                            container
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Grid item>Equity</Grid>
                            <Grid item>
                              <Currency
                                value={
                                  state.balance - (state.totalFixedIncome || 0)
                                }
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    ),
                  },
          }}
        />

        <br />
      </DialogContent>
    </Dialog>
  )
}
