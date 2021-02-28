import {
  Box,
  FormControlLabel,
  Grid,
  makeStyles,
  Switch,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import moment from "moment"
import React from "react"
import {
  accountGroups,
  assetsAccountTypes,
  loanAccountTypes,
  savingsInvestmentsAccountTypes,
} from "../accountTypes"
import { useFetchAccounts } from "../api/accounts"
import { useFetchCycleDates, useFetchCycleItems } from "../api/cycleItems"
import CycleNavigation from "../CycleNavigation"
import { IAccount } from "../db/Account"
import { IPayment } from "../db/Payment"
import AccountDialog from "../shared/AccountDialog"
import PaymentDialog from "../shared/PaymentDialog"
import { AccountGroupBox } from "./AccountGroupBox"
import { CarryOver } from "./CarryOver"
import { Currency } from "./Currency"

const useStyles = makeStyles((theme) => ({
  grid: {
    [theme.breakpoints.up("lg")]: {
      maxHeight: `calc(100vh - 100px)`,
    },
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
    .sort((a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance))

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

  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"))

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
        direction={isMdDown ? "row" : "column"}
      >
        {accountGroups.map((accountGroup) => (
          <AccountGroupBox
            key={accountGroup.label}
            accountGroup={accountGroup}
            cycleItems={cycleItems}
            accounts={accounts}
            isCurrentCycle={isCurrentCycle}
            date={date}
            onEditAccount={(a) => setEditAccount({ ...a })}
            onEditPayment={(p) => setEditPayment({ ...p })}
          />
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

      {accounts.map((account) => (
        <CarryOver
          key={account._id}
          account={account}
          items={cycleItems.filter(
            (x) => x.payment.account._id === account._id
          )}
          date={date}
          endDate={endDate}
          isCurrentCycle={isCurrentCycle}
        />
      ))}
    </>
  )
}
