import {
  Box,
  createStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  withStyles,
} from "@material-ui/core"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React from "react"
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

  const sum = React.useMemo(
    () => (cycle === null ? 0 : cycle.reduce((acc, x) => acc + x.amount, 0)),
    [cycle]
  )

  return (
    <>
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
      {cycle && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {cycle.map((x) => (
                <CycleItem cycleItem={x} key={x._id} />
              ))}
              <StyledTableRow>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell
                  align="right"
                  style={{
                    paddingRight: 135,
                    fontSize: 20,
                    fontWeight: "bold",
                    color: sum ? "green" : "red",
                  }}
                >
                  {formatMoney(sum)}
                </TableCell>
                <TableCell></TableCell>
              </StyledTableRow>
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
