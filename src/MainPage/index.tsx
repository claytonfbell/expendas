import {
  Box,
  Container,
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
  assetsAccountTypes,
  cashGroup,
  debtGroup,
  investmentGroup,
  loanAccountTypes,
  propertyGroup,
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
  footer: {
    backgroundColor: theme.palette.primary.main,
    position: "fixed",
    bottom: 0,
    left: 0,
    width: `100vw`,
    paddingLeft: theme.spacing(4),
    paddingRight: 16,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    color: theme.palette.primary.contrastText,
    [theme.breakpoints.up("sm")]: {
      fontSize: 24,
    },
    "& .right": {
      textAlign: "right",
    },
  },
}))

export function MainPage() {
  const classes = useStyles()
  const [date, setDate] = React.useState<string | null>(null)

  const { data: unfilteredCycleItems } = useFetchCycleItems(date)
  const { data: cycleDates } = useFetchCycleDates()
  const { data: unfilteredAccounts } = useFetchAccounts()

  const [includeSavings, setIncludeSavings] = React.useState(false)
  const [includePropertyLoans, setIncludePropertyLoans] = React.useState(false)
  const [includeSettled, setIncludeSettled] = React.useState(false)

  // filter-down
  const cycleItems = React.useMemo(
    () => unfilteredCycleItems.filter((x) => includeSettled || !x.isPaid),
    [includeSettled, unfilteredCycleItems]
  )
  const accounts = React.useMemo(
    () =>
      unfilteredAccounts
        // remove savings and investments
        .filter(
          (x) =>
            includeSavings || !savingsInvestmentsAccountTypes.includes(x.type)
        )
        // remove property and loans
        .filter(
          (x) =>
            includePropertyLoans ||
            (!assetsAccountTypes.includes(x.type) &&
              !loanAccountTypes.includes(x.type))
        )
        // remove accounts that have no activity unless including undettled
        .filter(
          (x) =>
            includeSettled ||
            x.currentBalance !== 0 ||
            cycleItems.filter((y) => y.payment.account._id === x._id).length > 0
        )
        // resort numerically
        .sort(
          (a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance)
        ),
    [
      cycleItems,
      includePropertyLoans,
      includeSavings,
      includeSettled,
      unfilteredAccounts,
    ]
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

      <FormControlLabel
        control={
          <Switch
            checked={includeSettled}
            onChange={(e, checked) => setIncludeSettled(checked)}
          />
        }
        label="Show Settled Payments"
      />

      <br />
      <br />

      <Grid alignContent="flex-start" container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <AccountGroupBox
            key={cashGroup.label}
            accountGroup={cashGroup}
            cycleItems={cycleItems}
            accounts={accounts}
            isCurrentCycle={isCurrentCycle}
            date={date}
            onEditAccount={(a) => setEditAccount({ ...a })}
            onEditPayment={(p) => setEditPayment({ ...p })}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AccountGroupBox
            key={debtGroup.label}
            accountGroup={debtGroup}
            cycleItems={cycleItems}
            accounts={accounts}
            isCurrentCycle={isCurrentCycle}
            date={date}
            onEditAccount={(a) => setEditAccount({ ...a })}
            onEditPayment={(p) => setEditPayment({ ...p })}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Grid alignContent="flex-start" container spacing={2}>
            <Grid item xs={12}>
              <AccountGroupBox
                key={investmentGroup.label}
                accountGroup={investmentGroup}
                cycleItems={cycleItems}
                accounts={accounts}
                isCurrentCycle={isCurrentCycle}
                date={date}
                onEditAccount={(a) => setEditAccount({ ...a })}
                onEditPayment={(p) => setEditPayment({ ...p })}
              />
            </Grid>
            <Grid item xs={12}>
              <AccountGroupBox
                key={propertyGroup.label}
                accountGroup={propertyGroup}
                cycleItems={cycleItems}
                accounts={accounts}
                isCurrentCycle={isCurrentCycle}
                date={date}
                onEditAccount={(a) => setEditAccount({ ...a })}
                onEditPayment={(p) => setEditPayment({ ...p })}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Box className={classes.footer}>
        <Container>
          <Grid container>
            <Grid item className="right" xs={12}>
              <Currency animate value={endingBalance} />
            </Grid>
          </Grid>
        </Container>
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
