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
import { Account, CarryOver, Payment } from "@prisma/client"
import moment from "moment"
import React from "react"
import { AccountDialog } from "./AccountDialog"
import {
  assetsAccountTypes,
  cashGroup,
  debtGroup,
  investmentGroup,
  loanAccountTypes,
  propertyGroup,
  savingsInvestmentsAccountTypes,
} from "./AccountGroup"
import { AccountGroupBox } from "./AccountGroupBox"
import { useFetchAccounts, useFetchDates, useFetchItems } from "./api/api"
import { CarryOverComponent } from "./CarryOverComponent"
import { Currency } from "./Currency"
import { CycleNavigation } from "./CycleNavigation"
import { PaymentDialog } from "./PaymentDialog"

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

export function Main() {
  const classes = useStyles()
  const [date, setDate] = React.useState<string | null>(null)

  const { data: unfilteredItems = [] } = useFetchItems(date)
  const { data: cycleDates = [] } = useFetchDates()
  const { data: unfilteredAccounts = [] } = useFetchAccounts()

  const [includeSavings, setIncludeSavings] = React.useState(false)
  const [includePropertyLoans, setIncludePropertyLoans] = React.useState(false)
  const [includeSettled, setIncludeSettled] = React.useState(false)

  // filter-down
  const items = React.useMemo(
    () => unfilteredItems.filter((x) => includeSettled || !x.isPaid),
    [includeSettled, unfilteredItems]
  )
  const accounts = React.useMemo(
    () =>
      unfilteredAccounts
        // remove savings and investments
        .filter(
          (x) =>
            includeSavings ||
            !savingsInvestmentsAccountTypes.includes(x.accountType)
        )
        // remove property and loans
        .filter(
          (x) =>
            includePropertyLoans ||
            (!assetsAccountTypes.includes(x.accountType) &&
              !loanAccountTypes.includes(x.accountType))
        )
        // remove accounts that have no activity unless including undettled
        .filter(
          (x) =>
            includeSettled ||
            x.balance !== 0 ||
            items.filter((y) => y.payment.accountId === x.id).length > 0
        )
        // resort numerically
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
    [
      items,
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
    .shift() as string

  // check if current cycle
  const today = moment()
  const isCurrentCycle =
    !today.isBefore(moment(date)) && !today.isAfter(moment(endDate))

  // find previous carryover
  const startingBalance = accounts.reduce((sum, account) => {
    const carryOver = account.carryOver.filter(
      (x) => x.date === date
    ) as CarryOver[]
    let startingBalance: number = account.balance
    if (carryOver.length > 0 && !isCurrentCycle) {
      startingBalance = carryOver.shift()?.amount || 0
    }
    return sum + startingBalance
  }, 0)
  const endingBalance = items
    .filter((x) => !x.isPaid)
    .filter(
      (x) => accounts.filter((y) => y.id === x.payment.account.id).length > 0
    )
    .reduce((sum, x) => sum + x.amount, startingBalance)

  const [editAccount, setEditAccount] = React.useState<Account>()
  const [editPayment, setEditPayment] = React.useState<Payment>()

  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"))

  return date === null ? null : (
    <>
      <CycleNavigation
        dates={cycleDates}
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
            includeSettled={includeSettled}
            accountGroup={cashGroup}
            cycleItems={items}
            accounts={accounts}
            isCurrentCycle={isCurrentCycle}
            date={date}
            onEditAccount={(a) => setEditAccount({ ...a })}
            onEditPayment={(p) => setEditPayment({ ...p })}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <AccountGroupBox
            includeSettled={includeSettled}
            accountGroup={debtGroup}
            cycleItems={items}
            accounts={accounts}
            isCurrentCycle={isCurrentCycle}
            date={date}
            onEditAccount={(a) => setEditAccount({ ...a })}
            onEditPayment={(p) => setEditPayment({ ...p })}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Grid alignContent="flex-start" container spacing={2}>
            {includeSavings ? (
              <Grid item xs={12}>
                <AccountGroupBox
                  includeSettled={includeSettled}
                  accountGroup={investmentGroup}
                  cycleItems={items}
                  accounts={accounts}
                  isCurrentCycle={isCurrentCycle}
                  date={date}
                  onEditAccount={(a) => setEditAccount({ ...a })}
                  onEditPayment={(p) => setEditPayment({ ...p })}
                />
              </Grid>
            ) : null}
            {includePropertyLoans ? (
              <Grid item xs={12}>
                <AccountGroupBox
                  includeSettled={includeSettled}
                  accountGroup={propertyGroup}
                  cycleItems={items}
                  accounts={accounts}
                  isCurrentCycle={isCurrentCycle}
                  date={date}
                  onEditAccount={(a) => setEditAccount({ ...a })}
                  onEditPayment={(p) => setEditPayment({ ...p })}
                />
              </Grid>
            ) : null}
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
        <CarryOverComponent
          key={account.id}
          account={account}
          items={items.filter((x) => x.payment.account.id === account.id)}
          date={date}
          endDate={endDate}
          isCurrentCycle={isCurrentCycle}
        />
      ))}
    </>
  )
}
