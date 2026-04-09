import {
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Account, CarryOver, Payment } from "@prisma/client"
import moment from "moment"
import React from "react"
import { useStorageState } from "react-storage-hooks"
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
import AnimatedCounter from "./AnimatedCounter"
import { useFetchAccounts, useFetchDates, useFetchItems } from "./api/api"
import { BottomStatusBar } from "./BottomStatusBar"
import { CarryOverComponent } from "./CarryOverComponent"
import { CycleNavigation } from "./CycleNavigation"
import { PaymentDialog } from "./PaymentDialog"

export function Main() {
  const theme = useTheme()
  const [date, setDate] = useStorageState<string | null>(
    sessionStorage,
    "Main.date",
    null
  )

  const { data: unfilteredItems = [] } = useFetchItems(date)
  const { data: dates = [] } = useFetchDates()
  const { data: unfilteredAccounts = [] } = useFetchAccounts()

  const [includeSavings, setIncludeSavings] = useStorageState(
    localStorage,
    `Main.includeSavings`,
    false
  )
  const [includePropertyLoans, setIncludePropertyLoans] = useStorageState(
    localStorage,
    `Main.includePropertyLoans`,
    false
  )
  const [includeSettled, setIncludeSettled] = useStorageState(
    localStorage,
    `Main.includeSettled`,
    false
  )

  // filter-down
  const items = React.useMemo(
    () =>
      unfilteredItems
        .filter((x) => includeSettled || !x.isPaid)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
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
    if (dates.length > 0 && date === null) {
      setDate(dates[0])
    }
  }, [dates, date, setDate])

  // find endDate
  const endDate: string = dates
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

  const isMdDown = useMediaQuery(theme.breakpoints.down("lg"))

  return date === null ? null : (
    <>
      <Stack spacing={2}>
        <CycleNavigation
          dates={dates}
          date={date}
          onChange={(x) => setDate(x)}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent={"center"}
          spacing={{ xs: 0, md: 1 }}
        >
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
        </Stack>

        <Grid alignContent="flex-start" container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <Grid alignContent="flex-start" container spacing={2}>
              {includeSavings ? (
                <Grid size={12}>
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
                <Grid size={12}>
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
      </Stack>

      <BottomStatusBar>
        <Stack direction="row" spacing={4} justifyContent="end">
          <Stack alignItems={"end"}>
            <Typography>Balance</Typography>
            <AnimatedCounter value={endingBalance} roundNearestDollar />
          </Stack>
        </Stack>
      </BottomStatusBar>

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
