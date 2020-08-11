import {
  Box,
  createStyles,
  Grid,
  Hidden,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  withStyles,
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
import { IPayment } from "../src/model/Payment"
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
      repeatsUntil:
        repeatsUntil !== null
          ? moment(repeatsUntil).format("YYYY-MM-DD")
          : null,
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
                <TableCell>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <IconButton size="small" onClick={handleEdit(p)}>
                        <EditIcon />
                      </IconButton>
                    </Grid>
                    <Grid item xs={6}>
                      <IconButton size="small" onClick={handleDelete(p._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
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
            when: moment().format("YYYY-MM-DD"),
            paidTo: "",
            repeatsUntil: null,
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
      <br />
      <br />
      <br />
      <br />
    </>
  )
}

export default () => (
  <InsideLayout title="Payments">
    <Planner />
  </InsideLayout>
)

export const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow)

export function getScheduleDescription(schedule: PaymentRequest | IPayment) {
  let msg: string = moment(schedule.when).format("l")
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
      moment(schedule.when).format("dddd") +
      (schedule.repeatsWeekly === 1
        ? " each week"
        : ` every ${schedule.repeatsWeekly} weeks`)
  }
  return msg
}
