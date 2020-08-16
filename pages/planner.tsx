import {
  createStyles,
  Grid,
  Link,
  makeStyles,
  Paper,
  TableRow,
  Theme,
  Tooltip,
  useTheme,
  withStyles,
} from "@material-ui/core"
import clsx from "clsx"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React, { ChangeEvent } from "react"
import useDebounce from "react-use/lib/useDebounce"
import { useAccount } from "../src/AccountProvider"
import AnimatedCounter from "../src/AnimatedCounter"
import { useCycle } from "../src/CycleProvider"
import { IAccount } from "../src/db/Account"
import { ICycleItemPopulated } from "../src/db/CycleItem"
import InsideLayout from "../src/InsideLayout"
import { useSignIn } from "../src/SignInProvider"

const useStyles = makeStyles((theme: Theme) => ({
  accountBox: {
    padding: 0,
  },
  isPaid: {
    textDecoration: "line-through",
    opacity: 0.5,
  },
  netWorth: {
    fontSize: 28,
  },
  row: {
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.background.default,
    },
  },
  leftCell: {
    padding: "4px 4px 4px 12px",
  },
  rightCell: {
    padding: "4px 12px 4px 4px",
    whiteSpace: "nowrap",
    hyphens: "none",
  },
  itemLink: {
    color: theme.palette.text.primary,
  },
}))

const RED = "#c82333"

export function formatMoney(input: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input / 100)
}

function Planner() {
  const classes = useStyles()
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
  }, [fetchAccounts, state.cycleDate])

  // find endDate
  const endDate: string = cycleDates
    .filter((x) => moment(x).isAfter(state.cycleDate))
    .shift()

  // check if current cycle
  const today = moment()
  const isCurrentCycle =
    !today.isBefore(moment(state.cycleDate)) && !today.isAfter(moment(endDate))

  // find previous carryover
  const startingBalance = accounts.reduce((sum, account) => {
    const carryOver = account.carryOver.filter(
      (x) => x.date === state.cycleDate
    )
    let startingBalance: number = account.currentBalance
    if (carryOver.length > 0 && !isCurrentCycle) {
      startingBalance = carryOver.shift().balance
    }
    return sum + startingBalance
  }, 0)

  const endingBalance = cycle
    .filter((x) => !x.isPaid)
    .reduce((sum, x) => sum + x.amount, startingBalance)

  return (
    <>
      <Grid
        container
        spacing={0}
        justify="space-between"
        alignContent="center"
        alignItems="center"
      >
        <Grid item xs={6} sm={4} md={3} lg={2}>
          <Form size="small" state={state} setState={setState}>
            <Select
              fullWidth
              allowNull
              name="cycleDate"
              label="Pay Day"
              options={cycleDates.map((x) => ({
                value: x,
                label: moment(x).format("M/D/YYYY"),
              }))}
            />
          </Form>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={3}>
        {accounts
          .sort(
            (a, b) =>
              cycle.filter((x) => x.payment.account._id === b._id).length -
              cycle.filter((x) => x.payment.account._id === a._id).length
          )
          .map((account) => {
            const items = cycle.filter(
              (x) => x.payment.account._id === account._id
            )
            return (
              <AccountBox
                key={account._id}
                account={account}
                items={items}
                date={state.cycleDate}
                endDate={endDate}
                isCurrentCycle={isCurrentCycle}
              />
            )
          })}
      </Grid>
      <br />
      <br />
      <hr />
      <Grid container justify="space-between">
        <Grid item>
          <span
            className={classes.netWorth}
            style={{ color: startingBalance < 0 ? RED : undefined }}
          >
            <AnimatedCounter value={startingBalance} />
          </span>
        </Grid>
        <Grid item>
          <span
            className={classes.netWorth}
            style={{ color: endingBalance < 0 ? RED : undefined }}
          >
            <AnimatedCounter value={endingBalance} />
          </span>
        </Grid>
      </Grid>
    </>
  )
}

type AccountBoxProps = {
  account: IAccount
  items: ICycleItemPopulated[]
  date: string
  endDate: string
  isCurrentCycle: boolean
}
function AccountBox({
  account,
  items,
  date,
  endDate,
  isCurrentCycle,
}: AccountBoxProps) {
  const classes = useStyles()
  const theme = useTheme()
  const { updateAccount } = useAccount()

  // find previous carryover
  const carryOver = account.carryOver.filter((x) => x.date === date)
  let startingBalance: number = account.currentBalance
  if (carryOver.length > 0 && !isCurrentCycle) {
    startingBalance = carryOver.shift().balance
  }

  const value =
    startingBalance +
    items.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  useDebounce(
    () => {
      if (endDate !== undefined) {
        console.log(`HIT ${value} ${account.name}`)
        updateAccount({
          ...account,
          carryOver: [
            ...(account.carryOver === undefined
              ? []
              : account.carryOver.filter((x) => x.date !== endDate)),
            { date: endDate, balance: value },
          ],
        })
      }
    },
    5000,
    [value, account._id, endDate]
  )

  if (items.length === 0 && account.currentBalance === 0) {
    return null
  }

  return (
    <React.Fragment key={account._id}>
      <Grid item xs={12} md={4}>
        <Paper variant="outlined" className={classes.accountBox}>
          <Grid
            container
            spacing={0}
            justify="space-between"
            className={classes.row}
          >
            <Grid item className={classes.leftCell}>
              <strong>{account.name}</strong>
            </Grid>
            <Grid item className={classes.rightCell}>
              <strong>{formatMoney(startingBalance)}</strong>
            </Grid>
          </Grid>
          {items.map((item) => (
            <CycleItemRow
              key={item._id}
              item={item}
              isCurrentCycle={isCurrentCycle}
            />
          ))}
          {items.length > 0 && (
            <Grid
              className={classes.row}
              container
              spacing={0}
              justify="space-between"
            >
              <Grid item className={classes.leftCell}>
                <Link href="javascript:;" onClick={() => alert(1)}>
                  + Add Item
                </Link>
              </Grid>
              <Grid
                item
                className={classes.rightCell}
                style={{
                  borderTop: "1px solid #999999",
                  minWidth: 120,
                  textAlign: "right",
                }}
              >
                <strong
                  style={
                    value < 0
                      ? { color: RED, fontWeight: "bold" }
                      : value > 0
                      ? {
                          color: theme.palette.primary.main,
                          fontWeight: "bold",
                        }
                      : undefined
                  }
                >
                  <AnimatedCounter value={value} />
                </strong>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Grid>
    </React.Fragment>
  )
}

function CycleItemRow({
  item,
  isCurrentCycle,
}: {
  item: ICycleItemPopulated
  isCurrentCycle: boolean
}) {
  const classes = useStyles()
  const { updateCycleItem } = useCycle()

  const handlePaidClick = (item: ICycleItemPopulated) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateCycleItem({ ...item, isPaid: e.target.checked })
  }

  const theme = useTheme()

  return (
    <Grid
      container
      spacing={0}
      justify="space-between"
      key={item._id}
      className={clsx(classes.row, item.isPaid ? classes.isPaid : undefined)}
      wrap="nowrap"
    >
      <Grid item className={classes.leftCell}>
        <Link
          href="javascript:;"
          onClick={() => alert(1)}
          className={classes.itemLink}
        >
          {item.payment.paidTo}
        </Link>
      </Grid>
      <Grid item className={classes.rightCell}>
        {isCurrentCycle && (
          <LargeTooltip
            arrow
            placement="left"
            title="Check if this item has already been settled and no longer impacts your account balance."
          >
            <input
              type="checkbox"
              checked={item.isPaid}
              onChange={handlePaidClick(item)}
            />
          </LargeTooltip>
        )}
        <span
          style={
            item.amount > 0 && !item.isPaid
              ? { color: theme.palette.primary.main, fontWeight: "bold" }
              : undefined
          }
        >
          {formatMoney(item.amount)}
        </span>
      </Grid>
    </Grid>
  )
}

export default () => (
  <InsideLayout>
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

export const LargeTooltip = withStyles({
  tooltip: {
    fontSize: 14,
    padding: 10,
  },
})(Tooltip)
