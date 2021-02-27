import { Grid, makeStyles, Theme } from "@material-ui/core"
import Checkbox from "material-ui-pack/dist/Checkbox"
import Form from "material-ui-pack/dist/Form"
import moment from "moment-timezone"
import React, { useEffect, useMemo, useState } from "react"
import {
  allAccountTypes,
  assetsAccountTypes,
  dailyAccountTypes,
  loanAccountTypes,
  savingsInvestmentsAccountTypes,
} from "../accountTypes"
import { useFetchAccounts } from "../api/accounts"
import { useFetchCycleDates, useFetchCycleItems } from "../api/cycleItems"
import CycleNavigation from "../CycleNavigation"
import { IAccount } from "../db/Account"
import { ICycleItemPopulated } from "../db/CycleItem"
import { useSignIn } from "../SignInProvider"
import { AccountBox } from "./AccountBox"
import { Currency } from "./Currency"

export const useStyles = makeStyles((theme: Theme) => ({
  netWorth: {
    fontSize: 28,
  },
  mainGrid: {
    [theme.breakpoints.up("sm")]: {
      maxHeight: `250vh`,
    },
  },
}))

export function PlannerPage() {
  const classes = useStyles()
  const { requireAuthentication } = useSignIn()
  requireAuthentication()

  const [state, setState] = useState({
    cycleDate: null,
    displaySavings: false,
    displayLoans: false,
    displayAssets: false,
    displayAccountsGrouped: false,
  })

  const { data: cycleDates } = useFetchCycleDates()

  useEffect(() => {
    if (cycleDates.length > 0 && state.cycleDate === null) {
      setState((x) => ({ ...x, cycleDate: cycleDates[0] }))
    }
  }, [cycleDates, state.cycleDate])

  const { data: cycle } = useFetchCycleItems(state.cycleDate)
  const { data: unfilteredAccounts } = useFetchAccounts()
  const accounts = useMemo(
    () =>
      unfilteredAccounts.filter((x) => {
        if (
          state.displaySavings &&
          savingsInvestmentsAccountTypes.includes(x.type)
        ) {
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
    .filter(
      (x) => accounts.filter((y) => y._id === x.payment.account._id).length > 0
    )
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
      <CycleNavigation
        date={state.cycleDate}
        cycleDates={cycleDates}
        onChange={(x) => setState((prev) => ({ ...prev, cycleDate: x }))}
      />

      <Form size="small" state={state} setState={setState}>
        <Grid container spacing={2} alignContent="center" alignItems="center">
          <Grid item xs={6} sm={4} md={3}>
            <Checkbox
              name="displaySavings"
              label="Include Savings / Investments"
            />
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
      <Grid
        container
        spacing={3}
        direction="column"
        className={classes.mainGrid}
      >
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
