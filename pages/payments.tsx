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
import Alert from "material-ui-bootstrap/dist/Alert"
import Button from "material-ui-bootstrap/dist/Button"
import moment from "moment-timezone"
import React from "react"
import ReactMarkdown from "react-markdown"
import { useDeletePayment, useFetchPayments } from "../src/api/payments"
import { IPayment, IPaymentPopulated } from "../src/db/Payment"
import InsideLayout from "../src/InsideLayout"
import PaymentDialog from "../src/PaymentDialog"
import { useSignIn } from "../src/SignInProvider"
import { AccountIcon, Currency, StyledTableRow } from "./planner"

function Payments() {
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const [deletePayment] = useDeletePayment()
  const { data: payments } = useFetchPayments()

  const [willDelete, setWillDelete] = React.useState<string>()

  const [selectedPayment, setSelectedPayment] = React.useState<IPayment>()
  const handleEdit = (payment: IPaymentPopulated) => () => {
    const {
      _id,
      account,
      amount,
      paidTo,
      date,
      repeatsOnDaysOfMonth,
      repeatsOnMonthsOfYear,
      repeatsWeekly,
      repeatsUntilDate = null,
    } = payment
    const pr: IPayment = {
      _id,
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
              <TableCell align="right"></TableCell>
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
            {payments.map((p) => {
              const feedback = getRepeatingPaymentFeedback(p)

              return (
                <StyledTableRow key={p._id}>
                  <TableCell>{p.paidTo}</TableCell>
                  <TableCell>
                    <span style={{ fontSize: 22 }}>
                      <AccountIcon account={p.account} />
                    </span>
                  </TableCell>
                  <Hidden smDown>
                    <TableCell>{p.account.name}</TableCell>
                  </Hidden>
                  <Hidden xsDown>
                    <TableCell>
                      {feedback.description}

                      {feedback.errors.length > 0 ? (
                        <>
                          <br />
                          <Alert color="danger">
                            <ReactMarkdown
                              source={`${feedback.errors.join("  \n")}`}
                            />
                          </Alert>
                        </>
                      ) : null}
                    </TableCell>
                  </Hidden>
                  <TableCell align="right">
                    <Currency value={p.amount} green />
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
              )
            })}
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

type ScheduleFeedback = {
  description: string
  errors: string[]
}

export function getRepeatingPaymentFeedback(
  schedule: IPayment | IPaymentPopulated
): ScheduleFeedback {
  let msg: string = moment(schedule.date).format("l")
  // repeating on dates
  if (schedule.repeatsOnDaysOfMonth !== null) {
    msg =
      schedule.repeatsOnDaysOfMonth
        .map((x) => moment.localeData().ordinal(x))
        .join(", ") + " of "
    if (
      schedule.repeatsOnMonthsOfYear === null ||
      schedule.repeatsOnMonthsOfYear.length === 12
    ) {
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

  // repeats until
  if (
    (schedule.repeatsOnDaysOfMonth !== null ||
      schedule.repeatsWeekly !== null) &&
    schedule.repeatsUntilDate !== null
  ) {
    msg += ` until ${moment(schedule.repeatsUntilDate).format("M/D/YYYY")}`
  }

  // errors
  let errors = []
  if (schedule.repeatsOnDaysOfMonth !== null) {
    const invalidDates = [29, 30, 31]
    errors = schedule.repeatsOnDaysOfMonth
      .map((x) =>
        invalidDates.includes(x)
          ? `Invalid repeating date **${moment.localeData().ordinal(x)}**`
          : undefined
      )
      .filter((x) => x !== undefined)
  }

  return {
    description: msg,
    errors,
  }
}
