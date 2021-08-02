import {
  Dialog,
  DialogContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { Payment } from "@prisma/client"
import { Button } from "material-ui-bootstrap"
import {
  Checkbox,
  CurrencyField,
  DatePicker,
  Form,
  Select,
  SelectBase,
  SubmitButton,
  TextField,
} from "material-ui-pack"
import React, { useEffect, useState } from "react"
import { displayAccountType } from "./accountTypes"
import { useAddPayment, useFetchAccounts, useUpdatePayment } from "./api/api"
import { RestError } from "./api/rest"
import { displayCreditCardType } from "./creditCardTypes"
import DisplayError from "./DisplayError"
import { useGlobalState } from "./GlobalStateProvider"
import { Title } from "./Title"

interface Props {
  payment: Payment | undefined
  onClose: () => void
}

type ActionType = "Payment" | "Deposit" | "Account Transfer"

export function PaymentDialog(props: Props) {
  const [error, setError] = useState<RestError>()
  useEffect(() => {
    if (props.payment !== undefined) {
      setError(undefined)
    }
  }, [props.payment])

  const [state, setState] = useState<Payment | undefined>()
  useEffect(() => {
    setState(props.payment)
  }, [props.payment])

  const { mutateAsync: updatePayment, isLoading: isUpdating } =
    useUpdatePayment()

  const { mutateAsync: addPayment, isLoading: isAdding } = useAddPayment()

  const isNew = state?.id === 0
  const isBusy = isUpdating || isAdding

  function handleSubmit() {
    if (state !== undefined) {
      if (isNew) {
        addPayment(state)
          .then(props.onClose)
          .catch((e) => setError(e))
      } else {
        updatePayment(state)
          .then(props.onClose)
          .catch((e) => setError(e))
      }
    }
  }

  const { organizationId } = useGlobalState()
  const { data: accounts = [] } = useFetchAccounts(organizationId)
  const accountOptions = accounts.map((a) => ({
    value: a.id,
    label: `${a.name} ${
      a.accountType === "Credit_Card" && a.creditCardType !== null
        ? displayCreditCardType(a.creditCardType)
        : displayAccountType(a.accountType)
    }`,
  }))

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  const [action, setAction] = useState<ActionType>("Payment")

  const actions: ActionType[] = ["Payment", "Deposit", "Account Transfer"]
  const [transferTo, setTransferTo] = useState<number | null>(null)

  return (
    <Dialog
      open={state !== undefined}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        <Title label={isNew ? `Add New ${action}` : `Update ${action}`} />
        <Form
          debug
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

            <Grid item xs={6}>
              <SelectBase
                size="small"
                margin="none"
                label="Action"
                value={action}
                onChange={(x) => setAction(x as ActionType)}
                options={actions
                  .filter((x) => isNew || x !== "Account Transfer")
                  .map((value) => ({ value, label: value }))}
              />
            </Grid>

            {action === "Deposit" ? (
              <Grid item xs={6}>
                <Checkbox name="isPaycheck" />
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <TextField name="description" />
            </Grid>
            <Grid item xs={12}>
              <Select
                label={action === "Deposit" ? "To Account" : "From Account"}
                name="accountId"
                options={accountOptions}
              />
            </Grid>

            {action === "Account Transfer" ? (
              <Grid item xs={12}>
                <SelectBase
                  value={transferTo}
                  onChange={(x) => setTransferTo(x as number | null)}
                  label="Transfer To"
                  options={accountOptions}
                  isNumeric
                  size="small"
                  margin="none"
                />
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <CurrencyField
                name="amount"
                inPennies
                numeric
                fullWidth
                allowNegative={false}
              />
            </Grid>

            <Grid item xs={12}>
              <DatePicker name="date" />
            </Grid>

            <Grid item xs={6}>
              <SubmitButton>
                {isNew ? "Add Payment" : "Save Changes"}
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
