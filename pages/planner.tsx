import {
  createStyles,
  Grid,
  Hidden,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Theme,
  withStyles,
} from "@material-ui/core"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React from "react"
import { useAccount } from "../src/AccountProvider"
import AnimatedCounter from "../src/AnimatedCounter"
import CycleItem from "../src/CycleItem"
import { useCycle } from "../src/CycleProvider"
import InsideLayout from "../src/InsideLayout"
import { useSignIn } from "../src/SignInProvider"

export function formatMoney(input: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input / 100)
}

function Planner() {
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const [state, setState] = React.useState({
    cycleDate: null,
  })
  const { fetchCycleDates, cycleDates } = useCycle()
  React.useEffect(() => {
    fetchCycleDates()
  }, [fetchCycleDates])

  React.useEffect(() => {
    if (cycleDates.length > 0 && state.cycleDate === null) {
      setState((x) => ({ ...x, cycleDate: cycleDates[1] }))
    }
  }, [cycleDates, state.cycleDate])

  const { cycle, fetchCycle } = useCycle()
  React.useEffect(() => {
    fetchCycle(state.cycleDate)
  }, [fetchCycle, state.cycleDate])

  const { accounts, fetchAccounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6} md={4}>
          <Form size="small" state={state} setState={setState}>
            <Select
              fullWidth
              allowNull
              name="cycleDate"
              options={cycleDates.map((x) => ({
                value: x,
                label: moment(x).format("dddd - LL"),
              }))}
            />
          </Form>
        </Grid>
        <Hidden smDown>
          <Grid item md={4}></Grid>
        </Hidden>
        <Grid item xs={12} sm={6} md={4}>
          {cycle && (
            <>
              <Grid container spacing={1} justify="space-between">
                {accounts.map((account) => {
                  const value =
                    account.currentBalance +
                    cycle
                      .filter((x) => !x.isPaid)
                      .filter((x) => x.payment.account._id === account._id)
                      .reduce((x, y) => x + y.amount, 0)

                  return (
                    <React.Fragment key={account._id}>
                      <Grid item xs={8}>
                        <div
                          style={{
                            fontSize: 20,
                          }}
                        >
                          {account.name}
                        </div>
                      </Grid>
                      <Grid
                        item
                        xs={4}
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "right",
                            color: value > 0 ? "green" : "red",
                            fontSize: 20,
                          }}
                        >
                          <AnimatedCounter value={value} />
                        </div>
                      </Grid>
                    </React.Fragment>
                  )
                })}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      <br />
      <br />
      {cycle && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {cycle.map((x) => (
                <CycleItem cycleItem={x} key={x._id} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <br />
      <br />
    </>
  )
}

export default () => (
  <InsideLayout title="Pay Cycle">
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
