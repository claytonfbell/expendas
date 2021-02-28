import {
  Box,
  Collapse,
  Divider,
  Fade,
  FormControlLabel,
  Grid,
  lighten,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Switch,
} from "@material-ui/core"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import clsx from "clsx"
import moment from "moment"
import React, { ChangeEvent } from "react"
import {
  AccountGroup,
  accountGroups,
  assetsAccountTypes,
  loanAccountTypes,
  savingsInvestmentsAccountTypes,
} from "../accountTypes"
import { useFetchAccounts, useUpdateAccount } from "../api/accounts"
import {
  useFetchCycleDates,
  useFetchCycleItems,
  useUpdateCycleItem,
} from "../api/cycleItems"
import CycleNavigation from "../CycleNavigation"
import { IAccount } from "../db/Account"
import { ICycleItem, ICycleItemPopulated } from "../db/CycleItem"
import { IPayment } from "../db/Payment"
import { AccountIcon } from "../PlannerPage/AccountIcon"
import { AmountInput } from "../PlannerPage/AmountInput"
import { Currency } from "../PlannerPage/Currency"
import { LargeTooltip } from "../PlannerPage/LargeTooltip"
import AccountDialog from "../shared/AccountDialog"
import PaymentDialog from "../shared/PaymentDialog"

const useStyles = makeStyles((theme) => ({
  grid: {
    maxHeight: `90vh`,
    marginBottom: 200,
  },
  footer: {
    backgroundColor: theme.palette.primary.main,
    position: "fixed",
    bottom: 0,
    left: 0,
    width: `100vw`,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    color: theme.palette.primary.contrastText,
    fontSize: 24,
    "& .right": {
      textAlign: "right",
    },
  },
}))

export function MainPage() {
  const classes = useStyles()
  const [date, setDate] = React.useState<string | null>(null)

  const { data: cycleItems } = useFetchCycleItems(date)
  const { data: cycleDates } = useFetchCycleDates()
  const { data: unfilteredAccounts } = useFetchAccounts()

  const [includeSavings, setIncludeSavings] = React.useState(false)
  const [includePropertyLoans, setIncludePropertyLoans] = React.useState(false)

  // filter-down
  const accounts = unfilteredAccounts
    .filter(
      (x) => includeSavings || !savingsInvestmentsAccountTypes.includes(x.type)
    )
    .filter(
      (x) =>
        includePropertyLoans ||
        (!assetsAccountTypes.includes(x.type) &&
          !loanAccountTypes.includes(x.type))
    )

  React.useEffect(() => {
    if (cycleDates.length > 0 && date === null) {
      setDate(cycleDates[0])
    }
  }, [cycleDates, date])

  // find endDate
  const endDate: string = cycleDates
    .filter((x) => moment(x).isAfter(date))
    .shift()

  // check if current cycle
  const today = moment()
  const isCurrentCycle =
    !today.isBefore(moment(date)) && !today.isAfter(moment(endDate))

  // find previous carryover
  const startingBalance = accounts.reduce((sum, account) => {
    const carryOver = account.carryOver.filter((x) => x.date === date)
    let startingBalance: number = account.currentBalance
    if (carryOver.length > 0 && !isCurrentCycle) {
      startingBalance = carryOver.shift().balance
    }
    return sum + startingBalance
  }, 0)
  const endingBalance = cycleItems
    .filter((x) => !x.isPaid)
    .filter(
      (x) => accounts.filter((y) => y._id === x.payment.account._id).length > 0
    )
    .reduce((sum, x) => sum + x.amount, startingBalance)

  const [editAccount, setEditAccount] = React.useState<IAccount>()
  const [editPayment, setEditPayment] = React.useState<IPayment>()

  return date === null ? null : (
    <>
      <CycleNavigation
        cycleDates={cycleDates}
        date={date}
        onChange={(x) => setDate(x)}
      />

      <FormControlLabel
        control={
          <Switch
            checked={includeSavings}
            onChange={(e, checked) => setIncludeSavings(checked)}
          />
        }
        label="Include Savings &amp; Investments"
      />

      <FormControlLabel
        control={
          <Switch
            checked={includePropertyLoans}
            onChange={(e, checked) => setIncludePropertyLoans(checked)}
          />
        }
        label="Include Property &amp; Loans"
      />

      <br />
      <br />

      <Grid
        alignContent="flex-start"
        className={classes.grid}
        container
        spacing={2}
      >
        {accountGroups.map((accountGroup) => (
          <Grid item key={accountGroup.label} xs={12} md={6} lg={4}>
            <AccountGroupBox
              accountGroup={accountGroup}
              cycleItems={cycleItems}
              accounts={accounts}
              isCurrentCycle={isCurrentCycle}
              date={date}
              onEditAccount={(a) => setEditAccount(a)}
              onEditPayment={(p) => setEditPayment(p)}
            />
          </Grid>
        ))}
      </Grid>
      <Box className={classes.footer}>
        <Grid container>
          <Grid item xs={6}>
            <Currency animate value={startingBalance} />
          </Grid>
          <Grid item className="right" xs={6}>
            <Currency animate value={endingBalance} />
          </Grid>
        </Grid>
      </Box>

      <AccountDialog
        account={editAccount}
        onClose={() => setEditAccount(undefined)}
      />

      {editPayment !== undefined ? (
        <PaymentDialog
          payment={editPayment}
          onClose={() => setEditPayment(undefined)}
        />
      ) : null}
    </>
  )
}

const useAccountGroupBoxStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(2),
  },
}))

type AccountGroupProps = {
  accountGroup: AccountGroup
  accounts: IAccount[]
  cycleItems: ICycleItem[]
  isCurrentCycle: boolean
  date: string
  onEditAccount: (account: IAccount) => void
  onEditPayment: (payment: IPayment) => void
}

function AccountGroupBox(props: AccountGroupProps) {
  const classes = useAccountGroupBoxStyles()
  const { accountGroup, isCurrentCycle, date } = props
  const [isExpanded, setIsExpanded] = React.useState(false)

  // filter-down
  const accounts = (props.accounts || []).filter((x) =>
    accountGroup.types.includes(x.type)
  )
  const cycleItems = (props.cycleItems || []).filter((x) =>
    accounts.map((y) => y._id).includes(x.payment.account._id)
  )

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
    cycleItems.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  return (
    <Fade in={accounts.length > 0}>
      <Paper elevation={4} className={classes.root}>
        <Box>
          <List>
            <ListItem button onClick={() => setIsExpanded(!isExpanded)}>
              <ListItemIcon>
                {!isExpanded ? (
                  <ExpandLessIcon style={{ color: "#fff" }} />
                ) : (
                  <ExpandMoreIcon style={{ color: "#fff" }} />
                )}
              </ListItemIcon>
              <ListItemText>{accountGroup.label}</ListItemText>
              <ListItemSecondaryAction>
                <Currency animate value={endingBalance} />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
          <Collapse in={isExpanded}>
            <Divider />
            {accounts.map((account) => (
              <AccountBox
                key={account._id}
                account={account}
                cycleItems={cycleItems}
                date={date}
                isCurrentCycle={isCurrentCycle}
                onEditAccount={props.onEditAccount}
                onEditPayment={props.onEditPayment}
              />
            ))}
          </Collapse>
        </Box>
      </Paper>
    </Fade>
  )
}

const useAccountBoxStyles = makeStyles((theme) => ({
  title: {
    color: theme.palette.text.primary,
    backgroundColor: lighten(theme.palette.primary.main, 0.67),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    textTransform: "uppercase",
    "&:nth-of-type(odd)": {
      backgroundColor: lighten(theme.palette.primary.main, 0.6),
    },
  },
  item: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    "&:nth-of-type(odd)": {
      backgroundColor: lighten(theme.palette.primary.main, 0.93),
    },
    "&.paid": {
      textDecoration: "line-through",
      color: lighten(theme.palette.text.primary, 0.7),
    },
  },

  left: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  right: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    textAlign: "right",
    "&.total": {
      borderTop: `2px solid ${lighten(theme.palette.primary.main, 0.5)}`,
    },
  },
  link: {
    cursor: "pointer",
  },
}))

type AccountBoxProps = {
  account: IAccount
  cycleItems: ICycleItem[]
  date: string
  isCurrentCycle: boolean
  onEditAccount: (account: IAccount) => void
  onEditPayment: (payment: IPayment) => void
}

function AccountBox(props: AccountBoxProps) {
  const classes = useAccountBoxStyles()
  const { account, date, isCurrentCycle } = props

  const cycleItems = (props.cycleItems || []).filter(
    (x) => x.payment.account._id === account._id
  )

  // find previous carryover
  const carryOver = React.useMemo(() => {
    const found = account.carryOver.find((x) => x.date === date)
    return found !== undefined ? found.balance : account.currentBalance
  }, [account.carryOver, account.currentBalance, date])
  let startingBalance = account.currentBalance
  if (!isCurrentCycle) {
    startingBalance = carryOver
  }

  const endingBalance =
    startingBalance +
    cycleItems.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  const [updateAccount] = useUpdateAccount()

  return (
    <>
      <Box className={classes.title}>
        <Grid container justify="space-between">
          <Grid item>
            <Link
              className={classes.link}
              onClick={() => props.onEditAccount(account)}
            >
              <AccountIcon account={account} />
              &nbsp;&nbsp;{account.name}
            </Link>
          </Grid>
          <Grid item>
            <AmountInputTool
              enabled={isCurrentCycle}
              value={startingBalance}
              onChange={(x) => updateAccount({ ...account, currentBalance: x })}
            />
          </Grid>
        </Grid>
      </Box>
      {cycleItems.map((item) => (
        <CycleItemRow
          key={item._id}
          item={item}
          onEditPayment={props.onEditPayment}
        />
      ))}
      {cycleItems.length === 0 ? null : (
        <Box className={classes.item}>
          <Grid container>
            <Grid item xs={9} className={classes.left}></Grid>
            <Grid item xs={3} className={clsx("total", classes.right)}>
              <Currency red animate value={endingBalance} />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  )
}

type CycleItemRowProps = {
  item: ICycleItemPopulated
  onEditPayment: (payment: IPayment) => void
}

function CycleItemRow(props: CycleItemRowProps) {
  const classes = useAccountBoxStyles()
  const { item } = props

  const [updateCycleItem] = useUpdateCycleItem()

  const handlePaidClick = (item: ICycleItemPopulated) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateCycleItem({ ...item, isPaid: e.target.checked })
  }

  const [isHover, setIsHover] = React.useState(false)

  return (
    <Box
      onMouseOver={() => setIsHover(true)}
      onMouseOut={() => setIsHover(false)}
      key={item._id}
      className={clsx(classes.item, item.isPaid ? "paid" : undefined)}
    >
      <Grid container>
        <Grid item xs={8} className={classes.left}>
          <Link
            color="inherit"
            className={classes.link}
            onClick={() => props.onEditPayment(item.payment)}
          >
            {item.payment.paidTo}
          </Link>
        </Grid>
        <Grid item xs={1} className={classes.left}>
          <Fade in={isHover}>
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
          </Fade>
        </Grid>
        <Grid item xs={3} className={classes.right}>
          <AmountInputTool
            green={!item.isPaid}
            enabled
            value={item.amount}
            onChange={(x) => updateCycleItem({ ...item, amount: x })}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

const useAmountInputToolStyles = makeStyles({
  link: {
    cursor: "pointer",
  },
})

type AmountInputToolProps = {
  value: number
  onChange: (newValue: number) => void
  enabled?: boolean
  green?: boolean
}
function AmountInputTool(props: AmountInputToolProps) {
  const classes = useAmountInputToolStyles()
  const { enabled, value, onChange } = props
  const [open, setOpen] = React.useState(false)

  function handleChange(newValue: number) {
    setOpen(false)
    onChange(newValue)
  }

  return (
    <>
      {enabled ? (
        open ? (
          <AmountInput value={value} onChange={handleChange} />
        ) : (
          <Link
            color="inherit"
            className={classes.link}
            onClick={() => setOpen(true)}
          >
            <Currency green={props.green} value={value} />
          </Link>
        )
      ) : (
        <Currency green={props.green} value={value} />
      )}
    </>
  )
}
