import {
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
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
import { ChangeEvent, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useFetchAccounts } from "../api/accounts"
import { refreshCycleItems } from "../api/cycleItems"
import {
  useCreatePayment,
  useDeletePayment,
  useUpdatePayment,
} from "../api/payments"
import { DayOfMonth, IPayment, MonthOfYear } from "../db/Payment"
import DisplayError from "../DisplayError"
import { RestError } from "../rest"
import { getRepeatingPaymentFeedback } from "./getRepeatingPaymentFeedback"

interface Props {
  payment: PaymentForm
  onClose: () => void
}

type RepeatsType = "weekly" | "dates"

export interface PaymentForm extends IPayment {
  account2?: string
  isTransfer?: boolean
}

export default function PaymentDialog(props: Props) {
  const [state, setState] = useState<PaymentForm>(props.payment)
  useEffect(() => {
    setIsIncome(props.payment.amount > 0)
    setState({
      ...props.payment,
      amount: Number(Math.abs(props.payment.amount).toFixed(2)),
    })
  }, [props.payment])

  const [error, setError] = useState<RestError>()
  const [createPayment, { isLoading: isCreatingPayment }] = useCreatePayment()
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePayment()
  const [deletePayment, { isLoading: isDeletingPayment }] = useDeletePayment()
  const isBusy = isCreatingPayment || isUpdatingPayment || isDeletingPayment

  async function handleSubmit() {
    try {
      setError(undefined)
      if (state._id === undefined) {
        if (state.isTransfer) {
          if (state.account === undefined || state.account === null) {
            const err: RestError = {
              status: 0,
              message: "Select account to transfer from.",
            }
            throw err
          }
          if (state.account2 === undefined || state.account2 === null) {
            const err: RestError = {
              status: 0,
              message: "Select account to transfer to.",
            }
            throw err
          }
          if (state.account === state.account2) {
            const err: RestError = {
              status: 0,
              message: "Select a different account to transfer to.",
            }
            throw err
          }
          if (Number(state.amount) <= 0) {
            const err: RestError = {
              status: 0,
              message: "Enter the amount to transfer.",
            }
            throw err
          }
          // submit two payments if transfer
          await createPayment({
            ...state,
            amount: -Number(state.amount),
            paidTo: `Transfer to ${
              accounts.find((x) => x._id === state.account2).name
            }`,
          })
          await createPayment({
            ...state,
            account: state.account2,
            paidTo: `Transfer from ${
              accounts.find((x) => x._id === state.account).name
            }`,
          })
          refreshCycleItems()
          props.onClose()
        } else {
          await createPayment({
            ...state,
            amount: isIncome ? Number(state.amount) : -Number(state.amount),
          })
          refreshCycleItems()
          props.onClose()
        }
      } else {
        await updatePayment({
          ...state,
          amount: isIncome ? Number(state.amount) : -Number(state.amount),
        })
        refreshCycleItems()
        props.onClose()
      }
    } catch (e) {
      setError(e)
    }
  }

  const { data: unsortedAccounts } = useFetchAccounts()

  const accounts = [...unsortedAccounts].sort((a, b) =>
    a.name.localeCompare(b.name)
  )
  const [isIncome, setIsIncome] = useState(false)
  const thirtyOneDays = Array.from(Array(31).keys())
  const twelveMonths = Array.from(Array(12).keys())
  const repeats =
    state.repeatsOnDaysOfMonth != null || state.repeatsWeekly !== null
  const repeatsMonths = state.repeatsOnMonthsOfYear !== null
  const repeatsType: RepeatsType =
    state.repeatsWeekly !== null ? "weekly" : "dates"
  const repeatsUntil = state.repeatsUntilDate !== null

  const [willDelete, setWillDelete] = useState<string>()

  const feedback = getRepeatingPaymentFeedback(state)

  // auto-select date of month if they change start date
  useEffect(() => {
    if (state.repeatsOnDaysOfMonth !== null) {
      const newArray = [...state.repeatsOnDaysOfMonth]
      const x = moment(state.date).date() as DayOfMonth
      if (!newArray.includes(x)) {
        newArray.push(x)
        newArray.sort((a, b) => a - b)
        setState((prev) => ({
          ...prev,
          repeatsOnDaysOfMonth: newArray,
        }))
      }
    }
  }, [state.date, state.repeatsOnDaysOfMonth])

  // auto-select monthif they change start date
  useEffect(() => {
    if (state.repeatsOnMonthsOfYear !== null) {
      const newArray = [...state.repeatsOnMonthsOfYear]
      const x = moment(state.date).month() as MonthOfYear
      if (!newArray.includes(x)) {
        newArray.push(x)
        newArray.sort((a, b) => a - b)
        setState((prev) => ({
          ...prev,
          repeatsOnMonthsOfYear: newArray,
        }))
      }
    }
  }, [state.date, state.repeatsOnMonthsOfYear])

  return (
    <Dialog open={props.payment !== undefined} onClose={props.onClose}>
      <DialogContent>
        <Typography variant="h1">
          {state._id === undefined ? `Create ` : ``}
          {state.isTransfer
            ? "Account Transfer"
            : isIncome
            ? `Deposit`
            : `Payment`}
        </Typography>
        <DisplayError error={error} />
        <Form
          busy={isBusy}
          margin="normal"
          state={state}
          setState={setState}
          size="small"
          onSubmit={handleSubmit}
        >
          <Collapse in={state._id === undefined}>
            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={state.isTransfer} />}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setState((prev) => ({
                    ...prev,
                    isTransfer: e.target.checked,
                  }))
                }
                label="Account Transfer"
              />
            </FormControl>
          </Collapse>

          <Collapse in={!state.isTransfer}>
            <FormControl>
              <FormControlLabel
                control={<Checkbox checked={isIncome} />}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIsIncome(e.target.checked)
                }
                label="Income Deposit"
              />
            </FormControl>
          </Collapse>
          <CurrencyField name="amount" numeric blankZero inPennies fulleWidth />
          <Collapse in={!state.isTransfer}>
            <TextField name="paidTo" label="Description" />
          </Collapse>
          <Select
            allowNull
            name="account"
            label={state.isTransfer || !isIncome ? "From Account" : "Account"}
            options={accounts.map((x) => ({ value: x._id, label: x.name }))}
          />
          <Collapse in={state.isTransfer}>
            <Select
              allowNull
              name="account2"
              label="Transfer To"
              options={accounts.map((x) => ({ value: x._id, label: x.name }))}
            />
          </Collapse>
          <DatePicker name="date" />
          <FormControlLabel
            control={<Checkbox checked={repeats} />}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (!e.target.checked) {
                setState((prev) => ({
                  ...prev,
                  repeatsOnDaysOfMonth: null,
                  repeatsWeekly: null,
                  repeatsOnMonthsOfYear: null,
                  repeatsUntilDate: null,
                }))
              } else {
                setState((prev) => ({
                  ...prev,
                  repeatsOnDaysOfMonth: null,
                  repeatsWeekly: 1,
                  repeatsOnMonthsOfYear: null,
                  repeatsUntilDate: null,
                }))
              }
            }}
            label="Repeating Payment"
          />
          <Collapse in={repeats}>
            <FormControl component="fieldset">
              <RadioGroup
                value={repeatsType}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const newType = event.target.value as RepeatsType
                  if (newType === "dates") {
                    setState((prev) => ({
                      ...prev,
                      repeatsWeekly: null,
                      repeatsOnDaysOfMonth: [
                        moment(state.date).date() as DayOfMonth,
                      ],
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
                  label="Monthly"
                />
              </RadioGroup>
            </FormControl>

            <Collapse in={repeatsType === "dates"}>
              {thirtyOneDays.map((x) => (
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
                  disabled={moment(state.date).date() === x + 1}
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    if (!e.target.checked) {
                      setState((prev) => ({
                        ...prev,
                        repeatsOnMonthsOfYear: null,
                      }))
                    } else {
                      setState((prev) => ({
                        ...prev,
                        repeatsOnMonthsOfYear: [
                          moment(state.date).month() as MonthOfYear,
                        ],
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
                      disabled={moment(state.date).month() === x}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (!e.target.checked) {
                    setState((prev) => ({
                      ...prev,
                      repeatsUntilDate: null,
                    }))
                  } else {
                    setState((prev) => ({
                      ...prev,
                      repeatsUntilDate: moment()
                        .add(1, "years")
                        .format("YYYY-MM-DD"),
                    }))
                  }
                }}
                label="Set End Date"
              />
            </FormControl>
            <Collapse in={repeatsUntil}>
              <DatePicker name="repeatsUntilDate" />
            </Collapse>

            <Alert color="info">{feedback.description}</Alert>

            {feedback.errors.length > 0 ? (
              <>
                <br />
                <Alert color="danger">
                  <ReactMarkdown source={`${feedback.errors.join("  \n")}`} />
                </Alert>
              </>
            ) : null}
          </Collapse>

          <br />
          <Grid container spacing={1}>
            <Grid item xs={state._id !== undefined ? 4 : 6}>
              <SubmitButton>
                {state._id === undefined ? `Create` : `Save`}
              </SubmitButton>
            </Grid>
            <Grid item xs={state._id !== undefined ? 4 : 6}>
              <Button fullWidth variant="outlined" onClick={props.onClose}>
                Cancel
              </Button>
            </Grid>
            {state._id !== undefined && (
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="danger"
                  onClick={() => setWillDelete(state._id)}
                >
                  Delete
                </Button>
              </Grid>
            )}
          </Grid>

          <br />
          <br />
        </Form>

        <Dialog
          open={willDelete !== undefined}
          onClose={() => setWillDelete(undefined)}
        >
          <DialogContent>
            <Typography>Are you sure you want to delete this item?</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setWillDelete(undefined)
                deletePayment(willDelete).then(refreshCycleItems)
                props.onClose()
              }}
            >
              Delete
            </Button>
            <Button onClick={() => setWillDelete(undefined)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
