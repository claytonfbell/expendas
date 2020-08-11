import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import EditIcon from "@material-ui/icons/Edit"
import Button from "material-ui-bootstrap/dist/Button"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React from "react"
import Cycle from "../src/Cycle"
import { useCycle } from "../src/CycleProvider"
import InsideLayout from "../src/InsideLayout"
import PaymentRequest from "../src/model/PaymentRequest"
import PaymentDialog from "../src/PaymentDialog"
import { IPaymentPopulated, usePayment } from "../src/PaymentProvider"
import { useSignIn } from "../src/SignInProvider"

export function formatMoney(input: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input)
}

function Planner() {
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const { payments, fetchPayments, deletePayment } = usePayment()

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  function getScheduleDescription(payment: IPaymentPopulated) {
    let msg: string = moment(payment.when).format("l")
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
          .map((x) => moment().month(x).format("MMMM"))
          .join(", ")
      }
    }
    // repeating weekly / biweekly
    else if (payment.repeatsWeekly !== null) {
      msg =
        moment(payment.when).format("dddd") +
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

  const handleDelete = (id: string) => () => deletePayment(id)

  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRequest>()
  const handleEdit = (payment: IPaymentPopulated) => () => {
    const {
      _id: id,
      account,
      amount,
      paidTo,
      when,
      repeatsOnDaysOfMonth,
      repeatsOnMonthsOfYear,
      repeatsWeekly,
      repeatsUntil,
    } = payment
    const pr: PaymentRequest = {
      id,
      account: account._id,
      amount,
      paidTo,
      when: moment(when).format("YYYY-MM-DD"),
      repeatsOnDaysOfMonth,
      repeatsOnMonthsOfYear,
      repeatsWeekly,
      repeatsUntil: moment(repeatsUntil).format("YYYY-MM-DD"),
    }
    setSelectedPayment(pr)
  }

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
              <TableCell align="right"></TableCell>
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
                <TableCell>
                  <IconButton size="small" onClick={handleEdit(p)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={handleDelete(p._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <Button
        onClick={() =>
          setSelectedPayment({
            account: "",
            amount: 0,
            when: moment().format("YYYY-MM-DD"),
            paidTo: "",
            repeatsUntil: null,
            repeatsOnDaysOfMonth: null,
            repeatsOnMonthsOfYear: null,
            repeatsWeekly: null,
          })
        }
      >
        Add New Payment
      </Button>
      {selectedPayment && (
        <PaymentDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(undefined)}
        />
      )}
      <br />
      <br />
      <Box maxWidth={300}>
        <Form size="small" state={state} setState={setState}>
          <Select
            allowNull
            name="cycleDate"
            options={cycleDates.map((x) => ({
              value: x,
              label: moment(x).format("dddd - LL"),
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
