import {
  Checkbox,
  Collapse,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core"
import Button from "material-ui-bootstrap/dist/Button"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import DatePicker from "material-ui-pack/dist/DatePicker"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import moment from "moment-timezone"
import React from "react"
import { useAccount } from "./AccountProvider"
import DisplayError from "./DisplayError"
import { DayOfMonth, MonthOfYear } from "./model/Payment"
import PaymentRequest from "./model/PaymentRequest"
import { usePayment } from "./PaymentProvider"
import { RestError } from "./rest"

interface Props {
  payment: PaymentRequest
  onClose: () => void
}

type RepeatsType = "weekly" | "dates"

export default function PaymentDialog(props: Props) {
  const [state, setState] = React.useState<PaymentRequest>(props.payment)
  React.useEffect(() => {
    setIsIncome(props.payment.amount > 0)
    setRepeats(
      props.payment.repeatsOnDaysOfMonth !== null ||
        props.payment.repeatsWeekly !== null
    )
    setRepeatsType(props.payment.repeatsOnDaysOfMonth ? "dates" : "weekly")
    setState({
      ...props.payment,
      amount: Number(Math.abs(props.payment.amount).toFixed(2)),
    })
  }, [props.payment])

  const [error, setError] = React.useState<RestError>()
  const { createPayment, busy } = usePayment()
  function handleSubmit() {
    setError(undefined)
    createPayment({
      ...state,
      amount: isIncome ? Number(state.amount) : -Number(state.amount),
    })
      .then(() => {
        props.onClose()
      })
      .catch((e) => setError(e))
  }

  const { fetchAccounts, accounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const [isIncome, setIsIncome] = React.useState(false)
  const [repeats, setRepeats] = React.useState(false)
  const [repeatsUntil, setRepeatsUntil] = React.useState(false)
  const [repeatsType, setRepeatsType] = React.useState<RepeatsType>("weekly")
  const [repeatsMonths, setRepeatsMonths] = React.useState(false)

  const twentyEightDays = Array.from(Array(28).keys())
  const twelveMonths = Array.from(Array(12).keys())

  React.useEffect(() => {
    if (repeatsType === "weekly") {
      setState((prev) => ({
        ...prev,
        repeatsOnDaysOfMonth: null,
        repeatsOnMonthsOfYear: null,
        repeatsWeekly: prev.repeatsWeekly === null ? 1 : prev.repeatsWeekly,
      }))
    } else {
      setState((prev) => ({
        ...prev,
        repeatsWeekly: null,
      }))
    }
  }, [repeatsType])

  React.useEffect(() => {
    if (!repeatsUntil) {
      setState((prev) => ({ ...prev, repeatsUntil: null }))
    }
  }, [repeatsUntil])

  return (
    <Dialog open={props.payment !== undefined} onClose={props.onClose}>
      <DialogContent>
        <Typography variant="h1">Create Payment</Typography>
        <DisplayError error={error} />
        <Form
          debug
          busy={busy}
          margin="normal"
          state={state}
          setState={setState}
          size="small"
          onSubmit={handleSubmit}
        >
          <FormControl>
            <FormControlLabel
              control={<Checkbox checked={isIncome} />}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setIsIncome(e.target.checked)
              }
              label="Income Deposit"
            />
          </FormControl>
          <CurrencyField name="amount" />
          <TextField name="paidTo" />
          <Select
            allowNull
            name="account"
            options={accounts.map((x) => ({ value: x._id, label: x.name }))}
          />
          <DatePicker name="when" />
          <FormControlLabel
            control={<Checkbox checked={repeats} />}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRepeats(e.target.checked)
            }
            label="Repeating Payment"
          />
          <Collapse in={repeats}>
            <FormControl component="fieldset">
              <RadioGroup
                value={repeatsType}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRepeatsType(event.target.value as RepeatsType)
                }
              >
                <FormControlLabel
                  value="weekly"
                  control={<Radio />}
                  label="Weekly"
                />
                <Collapse in={repeatsType === "weekly"}>
                  <Select
                    name="repeatsWeekly"
                    allowNull
                    options={[1, 2, 3, 4, 5, 6, 7, 8].map((value) => ({
                      value,
                      label: `Every ${value > 1 ? `${value} weeks` : `week`}`,
                    }))}
                    isNumeric
                  />
                </Collapse>

                <FormControlLabel
                  value="dates"
                  control={<Radio />}
                  label="On Dates"
                />
              </RadioGroup>
            </FormControl>

            <Collapse in={repeatsType === "dates"}>
              {twentyEightDays.map((x) => (
                <Button
                  key={x}
                  onClick={() => {
                    let arr =
                      state.repeatsOnDaysOfMonth === null
                        ? []
                        : state.repeatsOnDaysOfMonth
                    if (arr.includes((x + 1) as DayOfMonth)) {
                      arr = arr.filter((y) => y !== x + 1)
                    } else {
                      arr = [...arr, (x + 1) as DayOfMonth]
                    }
                    setState((prev) => ({
                      ...prev,
                      repeatsOnDaysOfMonth: arr.length > 0 ? arr : null,
                    }))
                  }}
                  color={"primary"}
                  variant={
                    state.repeatsOnDaysOfMonth !== null &&
                    state.repeatsOnDaysOfMonth.includes((x + 1) as DayOfMonth)
                      ? "contained"
                      : "text"
                  }
                >
                  {moment.localeData().ordinal(x + 1)}
                </Button>
              ))}
              <br />
              <FormControl>
                <FormControlLabel
                  control={<Checkbox checked={repeatsMonths} />}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRepeatsMonths(e.target.checked)
                  }
                  label="On Months"
                />
                <Collapse in={repeatsMonths}>
                  {twelveMonths.map((x) => (
                    <Button
                      key={x}
                      onClick={() => {
                        let arr =
                          state.repeatsOnMonthsOfYear === null
                            ? []
                            : state.repeatsOnMonthsOfYear
                        if (arr.includes(x as MonthOfYear)) {
                          arr = arr.filter((y) => y !== x)
                        } else {
                          arr = [...arr, x as MonthOfYear]
                        }
                        setState((prev) => ({
                          ...prev,
                          repeatsOnMonthsOfYear: arr.length > 0 ? arr : null,
                        }))
                      }}
                      color={"primary"}
                      variant={
                        state.repeatsOnMonthsOfYear !== null &&
                        state.repeatsOnMonthsOfYear.includes(x as MonthOfYear)
                          ? "contained"
                          : "text"
                      }
                    >
                      {moment().month(x).format("MMMM")}
                    </Button>
                  ))}
                </Collapse>
              </FormControl>
            </Collapse>

            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={repeatsUntil} />}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRepeatsUntil(e.target.checked)
                }
                label="Set End Date"
              />
            </FormControl>
            <Collapse in={repeatsUntil}>
              <DatePicker name="repeatsUntil" />
            </Collapse>
          </Collapse>
          <br />
          <SubmitButton>Create Payment</SubmitButton>
          <br />
          <br />
        </Form>
      </DialogContent>
    </Dialog>
  )
}
