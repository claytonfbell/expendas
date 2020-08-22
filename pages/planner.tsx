/* eslint-disable jsx-a11y/no-autofocus */
import {
  faApple,
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
} from "@fortawesome/free-brands-svg-icons"
import {
  faCreditCard,
  faHome,
  faMoneyBill,
  faMoneyCheckAlt,
  faPiggyBank,
  faUniversity,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  Collapse,
  createStyles,
  fade,
  Grid,
  Link,
  makeStyles,
  TableRow,
  Theme,
  Tooltip,
  useTheme,
  withStyles,
} from "@material-ui/core"
import clsx from "clsx"
import Checkbox from "material-ui-pack/dist/Checkbox"
import Form from "material-ui-pack/dist/Form"
import Select from "material-ui-pack/dist/Select"
import moment from "moment-timezone"
import React, { ChangeEvent } from "react"
import useDebounce from "react-use/lib/useDebounce"
import AccountDialog from "../src/AccountDialog"
import { useAccount } from "../src/AccountProvider"
import {
  allAccountTypes,
  assetsAccountTypes,
  dailyAccountTypes,
  loanAccountTypes,
  savingsAccountTypes,
} from "../src/accountTypes"
import AnimatedCounter from "../src/AnimatedCounter"
import { useCycle } from "../src/CycleProvider"
import { AccountType, IAccount } from "../src/db/Account"
import { ICycleItemPopulated } from "../src/db/CycleItem"
import { IPayment } from "../src/db/Payment"
import InsideLayout from "../src/InsideLayout"
import PaymentDialog from "../src/PaymentDialog"
import { useSignIn } from "../src/SignInProvider"

const useStyles = makeStyles((theme: Theme) => ({
  isPaid: {
    textDecoration: "line-through",
    opacity: 0.5,
  },
  netWorth: {
    fontSize: 28,
  },
  accountBox: {
    padding: 0,
  },
  accountHeader: {
    fontWeight: "bold",
    paddingTop: 6,
    paddingBottom: 6,
    borderTopLeftRadius: 10,
    backgroundColor: fade(theme.palette.primary.main, 0.15),
  },
  row: {
    borderLeft: "1px solid " + theme.palette.divider,
    borderRight: "1px solid " + theme.palette.divider,
    "&:nth-of-type(even)": {
      backgroundColor: theme.palette.background.default,
    },
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.background.paper,
    },
  },
  bottom: {
    borderBottomRightRadius: 10,
    borderBottom: "1px solid " + theme.palette.divider,
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
  inputAmount: {
    textAlign: "right",
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    width: 80,
    paddingBottom: 0,
    paddingTop: 0,
    backgroundColor: "transparent",
  },
}))

function Planner() {
  const classes = useStyles()
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const [state, setState] = React.useState({
    cycleDate: null,
    displaySavings: false,
    displayLoans: false,
    displayAssets: false,
    displayAccountsGrouped: false,
  })
  const { fetchCycleDates, cycleDates } = useCycle()
  React.useEffect(() => {
    fetchCycleDates()
  }, [fetchCycleDates])

  React.useEffect(() => {
    if (cycleDates.length > 0 && state.cycleDate === null) {
      setState((x) => ({ ...x, cycleDate: cycleDates[0] }))
    }
  }, [cycleDates, state.cycleDate])

  const { cycle, fetchCycle } = useCycle()
  React.useEffect(() => {
    fetchCycle(state.cycleDate)
  }, [fetchCycle, state.cycleDate])

  const { accounts: unfilteredAccounts, fetchAccounts } = useAccount()
  React.useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts, state.cycleDate])
  const accounts = React.useMemo(
    () =>
      unfilteredAccounts.filter((x) => {
        if (state.displaySavings && savingsAccountTypes.includes(x.type)) {
          return true
        } else if (state.displayLoans && loanAccountTypes.includes(x.type)) {
          return true
        } else if (state.displayAssets && assetsAccountTypes.includes(x.type)) {
          return true
        } else if (dailyAccountTypes.includes(x.type)) {
          return true
        }
        return false
      }),
    [
      state.displayAssets,
      state.displayLoans,
      state.displaySavings,
      unfilteredAccounts,
    ]
  )

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

  type Tmp = { key: string; accounts: IAccount[]; items: ICycleItemPopulated[] }
  const data: Tmp[] = []
  if (state.displayAccountsGrouped) {
    allAccountTypes.forEach((type) => {
      const acc = accounts.filter((y) => y.type === type)
      if (acc.length > 0) {
        data.push({
          key: type,
          accounts: acc,
          items: cycle.filter((x) => x.payment.account.type === type),
        })
      }
    })
  } else {
    accounts.forEach((acc) => {
      data.push({
        key: acc._id,
        accounts: [acc],
        items: cycle.filter((x) => x.payment.account._id === acc._id),
      })
    })
  }

  return (
    <>
      <Form size="small" state={state} setState={setState}>
        <Grid container spacing={2} alignContent="center" alignItems="center">
          <Grid item xs={12} sm={4} md={3} lg={2}>
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
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Checkbox name="displaySavings" label="Include Savings" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Checkbox name="displayLoans" label="Include Loans" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Checkbox name="displayAssets" label="Include Assets" />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Checkbox name="displayAccountsGrouped" label="Grouped" />
          </Grid>
        </Grid>
      </Form>
      <br />
      <Grid container spacing={3}>
        {data.map((x) => (
          <AccountBox
            key={x.key}
            accounts={x.accounts}
            items={x.items}
            date={state.cycleDate}
            endDate={endDate}
            isCurrentCycle={isCurrentCycle}
          />
        ))}
      </Grid>
      <br />
      <br />
      <hr />
      <Grid container justify="space-between">
        <Grid item>
          <span className={classes.netWorth}>
            <Currency value={startingBalance} animate red />
          </span>
        </Grid>
        <Grid item>
          <span className={classes.netWorth}>
            <Currency value={endingBalance} animate red />
          </span>
        </Grid>
      </Grid>
    </>
  )
}

interface CarryOverProps {
  account: IAccount
  date: string
  endDate: string
  items: ICycleItemPopulated[]
  isCurrentCycle: boolean
}
function CarryOver({
  account,
  date,
  endDate,
  items,
  isCurrentCycle,
}: CarryOverProps) {
  const { updateAccount } = useAccount()

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

  return <></>
}

type AccountBoxProps = {
  accounts: IAccount[]
  items: ICycleItemPopulated[]
  date: string
  endDate: string
  isCurrentCycle: boolean
}
function AccountBox({
  accounts,
  items,
  date,
  endDate,
  isCurrentCycle,
}: AccountBoxProps) {
  const classes = useStyles()
  const { updateAccount } = useAccount()

  // find previous carryover
  const carryOver = accounts.reduce((sum, x) => {
    const found = x.carryOver.find((x) => x.date === date)
    return sum + (found !== undefined ? found.balance : x.currentBalance)
  }, 0)
  let startingBalance: number = accounts.reduce(
    (sum, acc) => sum + acc.currentBalance,
    0
  )
  if (!isCurrentCycle) {
    startingBalance = carryOver
  }

  const endingBalance =
    startingBalance +
    items.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  const [editAccount, setEditAccount] = React.useState<IAccount>()
  const [editPayment, setEditPayment] = React.useState<IPayment>()

  const [editAmount, setEditAmount] = React.useState<number>()

  function handleUpdateAmount(currentBalance: number) {
    updateAccount({ ...accounts[0], currentBalance })
    setEditAmount(undefined)
  }

  return (
    <React.Fragment>
      {accounts.map((account) => (
        <CarryOver
          key={account._id}
          account={account}
          items={items.filter((x) => x.payment.account._id === account._id)}
          date={date}
          endDate={endDate}
          isCurrentCycle={isCurrentCycle}
        />
      ))}
      <Grid item xs={12} md={6} lg={4}>
        <div style={{ fontSize: 32, textAlign: "center" }}>
          {accounts.length === 1 ? (
            <AccountIcon account={accounts[0]} />
          ) : (
            <AccountTypeIcon type={accounts[0].type} />
          )}
        </div>
        <div className={classes.accountBox}>
          <Grid
            container
            spacing={0}
            justify="space-between"
            className={classes.accountHeader}
          >
            <Grid item className={classes.leftCell}>
              {accounts.length === 1 ? (
                <Link
                  href="javascript:;"
                  onClick={() => setEditAccount(accounts[0])}
                  className={classes.itemLink}
                >
                  {accounts[0].name}
                </Link>
              ) : (
                accounts[0].type
              )}
            </Grid>
            <Grid item className={classes.rightCell}>
              {editAmount === undefined &&
              isCurrentCycle &&
              accounts.length === 1 ? (
                <Link
                  href="javascript:;"
                  onClick={() => setEditAmount(accounts[0].currentBalance)}
                  className={classes.itemLink}
                >
                  <Currency value={startingBalance} />
                </Link>
              ) : editAmount !== undefined && isCurrentCycle ? (
                <AmountInput value={editAmount} onChange={handleUpdateAmount} />
              ) : (
                <Currency value={startingBalance} />
              )}
            </Grid>
          </Grid>
          <Collapse in={items.length > 0}>
            {items.map((item) => (
              <CycleItemRow
                key={item._id}
                item={item}
                isCurrentCycle={isCurrentCycle}
                onEditPayment={(x) => setEditPayment(x)}
              />
            ))}
          </Collapse>
          <Grid
            className={clsx(classes.row, classes.bottom)}
            container
            spacing={0}
            justify="space-between"
          >
            <Grid item className={classes.leftCell}>
              <Link
                href="javascript:;"
                onClick={() =>
                  setEditPayment({
                    paidTo: "",
                    amount: 0,
                    repeatsOnDaysOfMonth: null,
                    repeatsOnMonthsOfYear: null,
                    repeatsUntilDate: null,
                    repeatsWeekly: null,
                    account: accounts[0]._id,
                    date,
                  })
                }
              >
                + Add Item
              </Link>
            </Grid>
            <Grid
              item
              className={classes.rightCell}
              style={{
                borderTop: items.length > 0 ? "1px solid #999999" : undefined,
                minWidth: 120,
                textAlign: "right",
              }}
            >
              <Currency value={endingBalance} bold animate red />
            </Grid>
          </Grid>
        </div>
      </Grid>

      {editAccount && (
        <AccountDialog
          account={editAccount}
          onClose={() => setEditAccount(undefined)}
        />
      )}
      {editPayment && (
        <PaymentDialog
          payment={editPayment}
          onClose={() => setEditPayment(undefined)}
        />
      )}
    </React.Fragment>
  )
}

function CycleItemRow({
  item,
  isCurrentCycle,
  onEditPayment,
}: {
  item: ICycleItemPopulated
  isCurrentCycle: boolean
  onEditPayment: (payment: IPayment) => void
}) {
  const classes = useStyles()
  const { updateCycleItem } = useCycle()

  const handlePaidClick = (item: ICycleItemPopulated) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateCycleItem({ ...item, isPaid: e.target.checked })
  }

  const [editAmount, setEditAmount] = React.useState<number>()

  function handleUpdateAmount(amount: number) {
    updateCycleItem({ ...item, amount })
    setEditAmount(undefined)
  }

  return (
    <>
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
            onClick={() =>
              onEditPayment({
                ...item.payment,
                account: item.payment.account._id,
              })
            }
            className={classes.itemLink}
          >
            {item.payment.paidTo}
          </Link>
        </Grid>
        <Grid item className={classes.rightCell}>
          {editAmount === undefined ? (
            <>
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
              <Link
                href="javascript:;"
                onClick={() => setEditAmount(item.amount)}
                className={classes.itemLink}
              >
                <Currency value={item.amount} green />
              </Link>
            </>
          ) : (
            <AmountInput value={editAmount} onChange={handleUpdateAmount} />
          )}
        </Grid>
      </Grid>
    </>
  )
}

type AmountInputProps = {
  value: number
  onChange: (value: number) => void
}

function AmountInput(props: AmountInputProps) {
  const classes = useStyles()

  const [value, setValue] = React.useState<string>(centsToDollars(props.value))
  React.useEffect(() => {
    setValue(centsToDollars(props.value))
  }, [props.value])

  function centsToDollars(pennies: number) {
    return (pennies / 100).toFixed(2)
  }

  function dollarsToCents(dollars: string) {
    dollars = Number(dollars).toFixed(2)
    return Number(dollars.replace(/[^\d-]/g, ""))
  }

  const [firstKeyPressed, setFirstKeyPressed] = React.useState(false)

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    // backspace clears input
    if (e.keyCode === 8 && !firstKeyPressed) {
      setValue("")
    }

    // escape key cancels by sending back original value
    if (e.keyCode === 27) {
      props.onChange(props.value)
    }

    // enter key saves changes
    if (e.keyCode === 13) {
      props.onChange(dollarsToCents(value))
    }

    setFirstKeyPressed(true)
  }

  return (
    <input
      autoFocus
      className={classes.inputAmount}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/[^\d-.]/g, ""))}
      onBlur={() => props.onChange(dollarsToCents(value))}
      onKeyUp={handleKeyPress}
    />
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

export function formatMoney(input: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(input / 100)
}

export const LargeTooltip = withStyles({
  tooltip: {
    fontSize: 14,
    padding: 10,
  },
})(Tooltip)

interface CurrencyProps {
  value: number
  animate?: boolean
  bold?: boolean
  red?: boolean
  green?: boolean
}
export function Currency(props: CurrencyProps) {
  const RED = "#c82333"
  const theme = useTheme()

  return (
    <span
      style={{
        color:
          props.value < 0 && props.red
            ? RED
            : props.value > 0 && props.green
            ? theme.palette.primary.main
            : undefined,
        fontWeight: props.bold ? "bold" : undefined,
      }}
    >
      {props.animate ? (
        <AnimatedCounter value={props.value} />
      ) : (
        formatMoney(props.value)
      )}
    </span>
  )
}

interface AccountIconProps {
  account: IAccount
}
export function AccountIcon(props: AccountIconProps) {
  const theme = useTheme()
  return (
    <FontAwesomeIcon
      style={{ opacity: 0.8 }}
      icon={
        props.account.type === "Checking Account"
          ? faMoneyCheckAlt
          : props.account.type === "Cash"
          ? faMoneyBill
          : props.account.type === "Line of Credit" ||
            props.account.type === "Loan"
          ? faUniversity
          : props.account.type === "CD" ||
            props.account.type === "Savings Account"
          ? faPiggyBank
          : props.account.type === "Home Market Value"
          ? faHome
          : props.account.creditCardType === "Visa"
          ? faCcVisa
          : props.account.creditCardType === "Apple Card"
          ? faApple
          : props.account.creditCardType === "American Express"
          ? faCcAmex
          : props.account.creditCardType === "Discover"
          ? faCcDiscover
          : faCcMastercard
      }
      color={theme.palette.primary.main}
    />
  )
}

interface AccountTypeIconProps {
  type: AccountType
}
export function AccountTypeIcon(props: AccountTypeIconProps) {
  const theme = useTheme()
  return (
    <FontAwesomeIcon
      style={{ opacity: 0.8 }}
      icon={
        props.type === "Checking Account"
          ? faMoneyCheckAlt
          : props.type === "Cash"
          ? faMoneyBill
          : props.type === "Line of Credit" || props.type === "Loan"
          ? faUniversity
          : props.type === "CD" || props.type === "Savings Account"
          ? faPiggyBank
          : props.type === "Home Market Value"
          ? faHome
          : props.type === "Credit Card"
          ? faCreditCard
          : faUniversity
      }
      color={theme.palette.primary.main}
    />
  )
}
