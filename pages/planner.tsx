import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React from "react"
import Cycle from "../src/Cycle"
import { useCycle } from "../src/CycleProvider"
import InsideLayout from "../src/InsideLayout"
import { IPaymentPopulated, usePayment } from "../src/PaymentProvider"
import { useSignIn } from "../src/SignInProvider"

export function formatMoney(input: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input)
}

function Planner() {
  const { requireAuthentication, timeZone } = useSignIn()
  requireAuthentication()

  const { payments, fetchPayments } = usePayment()

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  function getScheduleDescription(payment: IPaymentPopulated) {
    let msg: string = moment(payment.when).tz(timeZone).format("l")
    // repeating on dates
    if (payment.repeatsOnDaysOfMonth !== null) {
      msg =
        payment.repeatsOnDaysOfMonth
          .map((x) => moment.localeData().ordinal(x))
          .join(", ") + " of "
      if (payment.repeatsOnMonthsOfYear === null) {
        msg += "each month"
      } else {
        msg += payment.repeatsOnMonthsOfYear
          .map((x) => moment().tz(timeZone).month(x).format("MMMM"))
          .join(", ")
      }
    }
    // repeating weekly / biweekly
    else if (payment.repeatsWeekly !== null) {
      msg =
        moment(payment.when).tz(timeZone).format("dddd") +
        (payment.repeatsWeekly === 1 ? " each week" : " every other week")
    }
    return msg
  }

  const [state, setState] = React.useState({
    cycleDate: null,
  })
  const { fetchCycleDates, cycleDates } = useCycle()
  React.useEffect(() => {
    fetchCycleDates()
  }, [fetchCycleDates])

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Transaction</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.paidTo}</TableCell>
                <TableCell>{p.account.name}</TableCell>
                <TableCell>{getScheduleDescription(p)}</TableCell>
                <TableCell
                  align="right"
                  style={{
                    fontWeight: p.amount > 0 ? "bold" : undefined,
                    color: p.amount > 0 ? "green" : undefined,
                  }}
                >
                  {formatMoney(p.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <br />
      <br />
      <Box maxWidth={300}>
        <Form size="small" state={state} setState={setState}>
          <Select
            allowNull
            name="cycleDate"
            options={cycleDates.map((x) => ({
              value: x,
              label: moment(x).tz(timeZone).format("dddd - LL"),
            }))}
          />
        </Form>
      </Box>

      <br />
      <br />
      {state.cycleDate !== null && <Cycle date={state.cycleDate} />}
    </>
  )
}

export default () => (
  <InsideLayout title="Payments">
    <Planner />
  </InsideLayout>
)
