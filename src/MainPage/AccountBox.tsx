import { Box, Grid, lighten, Link, makeStyles } from "@material-ui/core"
import clsx from "clsx"
import React from "react"
import { useUpdateAccount } from "../api/accounts"
import { IAccount } from "../db/Account"
import { ICycleItem } from "../db/CycleItem"
import { IPayment } from "../db/Payment"
import PayCardNow from "../PayCardNow"
import { AmountInputTool } from "./AmountInputTool"
import { Currency } from "./Currency"
import { CycleItemRow } from "./CycleItemRow"

export const useAccountBoxStyles = makeStyles((theme) => ({
  title: {
    borderTop: `1px solid ${theme.palette.primary.main}`,
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
  leftLink: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  alignRight: {
    textAlign: "right",
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
  checkbox: {
    padding: 0,
    mrginRight: theme.spacing(2),
  },
}))

type AccountBoxProps = {
  account: IAccount
  cycleItems: ICycleItem[]
  date: string
  isCurrentCycle: boolean
  includeSettled: boolean
  onEditAccount: (account: IAccount) => void
  onEditPayment: (payment: IPayment) => void
}

export function AccountBox(props: AccountBoxProps) {
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
          <Grid item xs={8}>
            <Link
              className={classes.link}
              onClick={() => props.onEditAccount(account)}
            >
              {account.name}
            </Link>
          </Grid>
          <Grid item xs={4} className={classes.alignRight}>
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
      {cycleItems.length === 0 && !props.includeSettled ? null : (
        <Box className={classes.item}>
          <Grid container>
            <Grid item xs={8} className={classes.leftLink}>
              <Link
                className={classes.link}
                onClick={() =>
                  props.onEditPayment({
                    paidTo: "",
                    amount: 0,
                    repeatsOnDaysOfMonth: null,
                    repeatsOnMonthsOfYear: null,
                    repeatsUntilDate: null,
                    repeatsWeekly: null,
                    account: account._id,
                    date,
                  })
                }
              >
                + Add Item
              </Link>
            </Grid>
            <Grid item xs={4} className={clsx("total", classes.right)}>
              <Currency red animate value={endingBalance} />
            </Grid>
            {isCurrentCycle && account.type === "Checking Account" ? (
              <Grid item xs={12}>
                <Box padding={2}>
                  <PayCardNow
                    account={account}
                    endingBalance={endingBalance}
                    onClick={(p) => props.onEditPayment(p)}
                    date={date}
                  />
                </Box>
              </Grid>
            ) : null}
          </Grid>
        </Box>
      )}
    </>
  )
}
