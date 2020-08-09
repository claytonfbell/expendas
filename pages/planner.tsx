import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import moment from "moment"
import React from "react"
import InsideLayout from "../src/InsideLayout"
import { IPaymentPopulated, usePayment } from "../src/PaymentProvider"
import { useSignIn } from "../src/SignInProvider"

function Planner() {
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const { payments, fetchPayments } = usePayment()

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  function formatMoney(input: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(input)
  }

  function getScheduleDescription(payment: IPaymentPopulated) {
    let msg: string = moment(payment.when).toISOString()

    if (payment.repeatsOnDaysOfMonth !== null) {
      msg =
        payment.repeatsOnDaysOfMonth
          .map((x) => moment.localeData().ordinal(x))
          .join(", ") + " of "
      if (payment.repeatsOnMonthsOfYear === null) {
        msg += "each month"
      } else {
        msg += payment.repeatsOnMonthsOfYear
          .map((x) =>
            moment()
              .month(x - 1)
              .format("MMMM")
          )
          .join(", ")
      }
    }

    return msg
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Paid To</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.paidTo}</TableCell>
                <TableCell>{p.method.name}</TableCell>
                <TableCell>{getScheduleDescription(p)}</TableCell>
                <TableCell
                  align="right"
                  style={{
                    color: p.method.type === "Paycheck" ? "green" : undefined,
                  }}
                >
                  {p.method.type === "Paycheck"
                    ? formatMoney(p.amount)
                    : formatMoney(-p.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default () => (
  <InsideLayout title="Payments">
    <Planner />
  </InsideLayout>
)
