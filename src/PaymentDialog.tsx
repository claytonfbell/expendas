import {
  Checkbox,
  Collapse,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@material-ui/core"
import Alert from "material-ui-bootstrap/dist/Alert"
import Button from "material-ui-bootstrap/dist/Button"
import CurrencyField from "material-ui-pack/dist/CurrencyField"
import DatePicker from "material-ui-pack/dist/DatePicker"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import SubmitButton from "material-ui-pack/dist/SubmitButton"
import TextField from "material-ui-pack/dist/TextField"
import moment from "moment-timezone"
import React from "react"
import { getScheduleDescription } from "../pages/planner"
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
    setState({
      ...props.payment,
      amount: Number(Math.abs(props.payment.amount).toFixed(2)),
    })
  }, [props.payment])

  const [error, setError] = React.useState<RestError>()
  const { busy, createPayment, updatePayment } = usePayment()
  function handleSubmit() {
    setError(undefined)
    if (state.id === undefined) {
      createPayment({
        ...state,
        amount: isIncome ? Number(state.amount) : -Number(state.amount),
      })
        .then(() => {
          props.onClose()
        })
        .catch((e) => setError(e))
    } else {
      updatePayment({
        ...state,
        amount: isIncome ? Number(state.amount) : -Number(state.amount),
      })
        .then(() => {
          props.onClose()
        })
        .catch((e) => setError(e))
    }
  }

  const { fetchAccounts, accounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const [isIncome, setIsIncome] = React.useState(false)
  const twentyEightDays = Array.from(Array(28).keys())
  const twelveMonths = Array.from(Array(12).keys())
  const repeats =
    state.repeatsOnDaysOfMonth != null || state.repeatsWeekly !== null
  const repeatsMonths = state.repeatsOnMonthsOfYear !== null
  const repeatsType: RepeatsType =
    state.repeatsWeekly !== null ? "weekly" : "dates"
  const repeatsUntil = state.repeatsUntil !== null

  return (
    <Dialog open={props.payment !== undefined} onClose={props.onClose}>
      <DialogContent>
        <Typography variant="h1">
          {state.id === undefined ? `Create ` : ``}
          {isIncome ? `Deposit` : `Payment`}
        </Typography>
        <DisplayError error={error} />
        <Form
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (!e.target.checked) {
                setState((prev) => ({
                  ...prev,
                  repeatsOnDaysOfMonth: null,
                  repeatsWeekly: null,
                  repeatsOnMonthsOfYear: null,
                  repeatsUntil: null,
                }))
              } else {
                setState((prev) => ({
                  ...prev,
                  repeatsOnDaysOfMonth: null,
                  repeatsWeekly: 1,
                  repeatsOnMonthsOfYear: null,
                  repeatsUntil: null,
                }))
              }
            }}
            label="Repeating Payment"
          />
          <Collapse in={repeats}>
            <FormControl component="fieldset">
              <RadioGroup
                value={repeatsType}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const newType = event.target.value as RepeatsType
                  if (newType === "dates") {
                    setState((prev) => ({
                      ...prev,
                      repeatsWeekly: null,
                      repeatsOnDaysOfMonth: [1],
                    }))
                  } else {
                    setState((prev) => ({
                      ...prev,
                      repeatsWeekly: 1,
                      repeatsOnDaysOfMonth: null,
                    }))
                  }
                }}
              >
                <FormControlLabel
                  value="weekly"
                  control={<Radio />}
                  label="Weekly"
                />
                <Collapse in={repeatsType === "weekly"}>
                  <Select
                    name="repeatsWeekly"
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
                      repeatsOnDaysOfMonth:
                        arr.length > 0 ? arr.sort((a, b) => a - b) : null,
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.target.checked) {
                      setState((prev) => ({
                        ...prev,
                        repeatsOnMonthsOfYear: null,
                      }))
                    } else {
                      setState((prev) => ({
                        ...prev,
                        repeatsOnMonthsOfYear: [0],
                      }))
                    }
                  }}
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
                          arr = [...arr, x as MonthOfYear].sort()
                        }
                        setState((prev) => ({
                          ...prev,
                          repeatsOnMonthsOfYear:
                            arr.length > 0 ? arr.sort((a, b) => a - b) : null,
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (!e.target.checked) {
                    setState((prev) => ({
                      ...prev,
                      repeatsUntil: null,
                    }))
                  } else {
                    setState((prev) => ({
                      ...prev,
                      repeatsUntil: moment()
                        .add(1, "years")
                        .format("YYYY-MM-DD"),
                    }))
                  }
                }}
                label="Set End Date"
              />
            </FormControl>
            <Collapse in={repeatsUntil}>
              <DatePicker name="repeatsUntil" />
            </Collapse>

            <Alert color="info">{getScheduleDescription(state)}</Alert>
          </Collapse>

          <br />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SubmitButton>
                {state.id === undefined ? `Create Payment` : `Save Changes`}
              </SubmitButton>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth variant="outlined" onClick={props.onClose}>
                Cancel
              </Button>
            </Grid>
          </Grid>

          <br />
          <br />
        </Form>
      </DialogContent>
    </Dialog>
  )
}
