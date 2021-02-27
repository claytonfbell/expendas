import { Collapse, Grid, Link } from "@material-ui/core"
import clsx from "clsx"
import React, { useState } from "react"
import { useUpdateAccount } from "../api/accounts"
import { IAccount } from "../db/Account"
import { ICycleItemPopulated } from "../db/CycleItem"
import { IPayment } from "../db/Payment"
import PayCardNow from "../PayCardNow"
import AccountDialog from "../shared/AccountDialog"
import PaymentDialog from "../shared/PaymentDialog"
import { AccountIcon } from "./AccountIcon"
import { AccountTypeIcon } from "./AccountTypeIcon"
import { AmountInput } from "./AmountInput"
import { CarryOver } from "./CarryOver"
import { Currency } from "./Currency"
import { CycleItemRow } from "./CycleItemRow"
import { usePlannerStyles } from "./usePlannerStyles"

type Props = {
  accounts: IAccount[]
  items: ICycleItemPopulated[]
  date: string
  endDate: string
  isCurrentCycle: boolean
}
export function AccountBox({
  accounts,
  items,
  date,
  endDate,
  isCurrentCycle,
}: Props) {
  const classes = usePlannerStyles()
  const [updateAccount] = useUpdateAccount()

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

  const [editAccount, setEditAccount] = useState<IAccount>()
  const [editPayment, setEditPayment] = useState<IPayment>()

  const [editAmount, setEditAmount] = useState<number>()

  function handleUpdateAmount(currentBalance: number) {
    updateAccount({ ...accounts[0], currentBalance })
    setEditAmount(undefined)
  }

  return (
    <>
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

              {isCurrentCycle &&
              accounts[0].type === "Checking Account" &&
              accounts.length === 1 ? (
                <PayCardNow
                  account={accounts[0]}
                  endingBalance={endingBalance}
                  onClick={(p) => setEditPayment(p)}
                  date={date}
                />
              ) : null}
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
    </>
  )
}
