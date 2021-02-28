import {
  Box,
  Collapse,
  Divider,
  Grid,
  lighten,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
} from "@material-ui/core"
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import clsx from "clsx"
import moment from "moment"
import React from "react"
import { AccountGroup, accountGroups } from "../accountTypes"
import { useFetchAccounts } from "../api/accounts"
import { useFetchCycleDates, useFetchCycleItems } from "../api/cycleItems"
import CycleNavigation from "../CycleNavigation"
import { IAccount } from "../db/Account"
import { ICycleItem } from "../db/CycleItem"
import { AccountIcon } from "../PlannerPage/AccountIcon"
import { Currency } from "../PlannerPage/Currency"

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
    color: theme.palette.primary.contrastText,
    fontSize: 32,
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
  const { data: accounts } = useFetchAccounts()

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

  return date === null ? null : (
    <>
      <CycleNavigation date={date} onChange={(x) => setDate(x)} />
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
}

function AccountGroupBox(props: AccountGroupProps) {
  const classes = useAccountGroupBoxStyles()
  const { accountGroup, cycleItems, isCurrentCycle, date } = props
  const [isExpanded, setIsExpanded] = React.useState(false)

  const accounts = (props.accounts || []).filter((x) =>
    accountGroup.types.includes(x.type)
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

  return accounts.length === 0 ? null : (
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
            />
          ))}
        </Collapse>
      </Box>
    </Paper>
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
}))

type AccountBoxProps = {
  account: IAccount
  cycleItems: ICycleItem[]
  date: string
  isCurrentCycle: boolean
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

  return (
    <>
      <Box className={classes.title}>
        <Grid container justify="space-between">
          <Grid item>
            <AccountIcon account={account} />
            &nbsp;&nbsp;{account.name}
          </Grid>
          <Grid item>
            <Currency value={startingBalance} />
          </Grid>
        </Grid>
      </Box>
      {cycleItems.map((item) => (
        <Box key={item._id} className={classes.item}>
          <Grid container>
            <Grid item xs={9} className={classes.left}>
              {item.payment.paidTo}
            </Grid>
            <Grid item xs={3} className={classes.right}>
              <Currency value={item.amount} />
            </Grid>
          </Grid>
        </Box>
      ))}
      {cycleItems.length === 0 ? null : (
        <Box className={classes.item}>
          <Grid container>
            <Grid item xs={9} className={classes.left}></Grid>
            <Grid item xs={3} className={clsx("total", classes.right)}>
              <Currency animate value={endingBalance} />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  )
}
