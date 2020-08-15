import {
  createStyles,
  Grid,
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
  }, [fetchAccounts])

  const netWorth = accounts.reduce((sum, x) => sum + x.currentBalance, 0)
  const projectedNetWorth = cycle
    .filter((x) => !x.isPaid)
    .reduce((sum, x) => sum + x.amount, netWorth)

  const theme = useTheme()

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
              />
            )
          })}
      </Grid>
      <br />
      <br />
      <hr />
      <Grid container justify="flex-end">
        <Grid item>
          <span
            className={classes.netWorth}
            style={{ color: projectedNetWorth < 0 ? RED : undefined }}
          >
            <AnimatedCounter value={projectedNetWorth} />
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
}
function AccountBox({ account, items, date }: AccountBoxProps) {
  const classes = useStyles()
  const theme = useTheme()
  const { updateAccount } = useAccount()

  const value =
    account.currentBalance +
    items.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  useDebounce(
    () => {
      console.log(`HIT ${value} ${account.name}`)
      updateAccount({
        ...account,
        carryOver: [
          ...(account.carryOver === undefined
            ? []
            : account.carryOver.filter((x) => x.date !== date)),
          { date, balance: value },
        ],
      })
    },
    5000,
    [value, account._id, date]
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
              <strong>{formatMoney(account.currentBalance)}</strong>
            </Grid>
          </Grid>
          {items.map((item) => (
            <CycleItemRow key={item._id} item={item} />
          ))}
          {items.length > 0 && (
            <Grid
              className={classes.row}
              container
              spacing={0}
              justify="space-between"
            >
              <Grid item className={classes.leftCell}>
                <em style={{ opacity: 0.6 }}>Pojected balance</em>
              </Grid>
              <Grid item className={classes.rightCell}>
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

function CycleItemRow({ item }: { item: ICycleItemPopulated }) {
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
        {item.payment.paidTo}
      </Grid>
      <Grid item className={classes.rightCell}>
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
