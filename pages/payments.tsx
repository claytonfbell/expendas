import {
  Dialog,
  DialogActions,
  DialogContent,
  Hidden,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core"
import DeleteIcon from "@material-ui/icons/Delete"
import EditIcon from "@material-ui/icons/Edit"
import Button from "material-ui-bootstrap/dist/Button"
import moment from "moment-timezone"
import React from "react"
import { IPayment } from "../src/db/Payment"
import InsideLayout from "../src/InsideLayout"
import PaymentRequest from "../src/model/PaymentRequest"
import PaymentDialog from "../src/PaymentDialog"
import { IPaymentPopulated, usePayment } from "../src/PaymentProvider"
import { useSignIn } from "../src/SignInProvider"
import { formatMoney, StyledTableRow } from "./planner"

function Payments() {
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const { payments, fetchPayments, deletePayment } = usePayment()

  React.useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const [willDelete, setWillDelete] = React.useState<string>()

  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRequest>()
  const handleEdit = (payment: IPaymentPopulated) => () => {
    const {
      _id: id,
      account,
      amount,
      paidTo,
      date,
      repeatsOnDaysOfMonth,
      repeatsOnMonthsOfYear,
      repeatsWeekly,
      repeatsUntilDate = null,
    } = payment
    const pr: PaymentRequest = {
      id,
      account: account._id,
      amount,
      paidTo,
      date,
      repeatsOnDaysOfMonth,
      repeatsOnMonthsOfYear,
      repeatsWeekly,
      repeatsUntilDate,
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
              <Hidden smDown>
                <TableCell>Account</TableCell>
              </Hidden>
              <Hidden xsDown>
                <TableCell>Schedule</TableCell>
              </Hidden>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <StyledTableRow key={p.id}>
                <TableCell>{p.paidTo}</TableCell>
                <Hidden smDown>
                  <TableCell>{p.account.name}</TableCell>
                </Hidden>
                <Hidden xsDown>
                  <TableCell>{getScheduleDescription(p)}</TableCell>
                </Hidden>
                <TableCell
                  align="right"
                  style={{
                    fontWeight: p.amount > 0 ? "bold" : undefined,
                    color: p.amount > 0 ? "green" : undefined,
                  }}
                >
                  {formatMoney(p.amount)}
                </TableCell>
                <TableCell style={{ minWidth: 96 }}>
                  <IconButton size="small" onClick={handleEdit(p)}>
                    <EditIcon />
                  </IconButton>
                  <Hidden mdDown>
                    <IconButton
                      size="small"
                      onClick={() => setWillDelete(p._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Hidden>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br />
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          setSelectedPayment({
            account: "",
            amount: 0,
            date: moment().format("YYYY-MM-DD"),
            paidTo: "",
            repeatsUntilDate: null,
            repeatsOnDaysOfMonth: null,
            repeatsOnMonthsOfYear: null,
            repeatsWeekly: null,
          })
        }
      >
        Add New Payment or Income
      </Button>
      {selectedPayment && (
        <PaymentDialog
          payment={selectedPayment}
          onClose={() => setSelectedPayment(undefined)}
        />
      )}
      <br />
      <br />

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
              deletePayment(willDelete)
              setWillDelete(undefined)
            }}
          >
            Delete
          </Button>
          <Button onClick={() => setWillDelete(undefined)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default () => (
  <InsideLayout title={"Payments & Deposits"}>
    <Payments />
  </InsideLayout>
)

export function getScheduleDescription(schedule: PaymentRequest | IPayment) {
  let msg: string = moment(schedule.date).format("l")
  // repeating on dates
  if (schedule.repeatsOnDaysOfMonth !== null) {
    msg =
      schedule.repeatsOnDaysOfMonth
        .map((x) => moment.localeData().ordinal(x))
        .join(", ") + " of "
    if (schedule.repeatsOnMonthsOfYear === null) {
      msg += "each month"
    } else {
      msg += schedule.repeatsOnMonthsOfYear
        .map((x) => moment().month(x).format("MMMM"))
        .join(", ")
    }
  }
  // repeating weekly / biweekly
  else if (schedule.repeatsWeekly !== null) {
    msg =
      moment(schedule.date).format("dddd") +
      (schedule.repeatsWeekly === 1
        ? " each week"
        : ` every ${schedule.repeatsWeekly} weeks`)
  }
  return msg
}
