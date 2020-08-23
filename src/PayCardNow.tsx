import { Link } from "@material-ui/core"
import moment from "moment"
import React from "react"
import { formatMoney } from "../pages/planner"
import { useAccount } from "./AccountProvider"
import { useCycle } from "./CycleProvider"
import { IAccount } from "./db/Account"
import { PaymentForm } from "./PaymentDialog"

interface Props {
  endingBalance: number
  account: IAccount
  onClick: (payment: PaymentForm) => void
}

export default function PayCardNow(props: Props) {
  const { accounts } = useAccount()
  const { cycle } = useCycle()

  // find checking account ending balance
  const availableToPay = props.endingBalance - 10000

  // find largest credit card debt
  const cca = accounts
    .filter((x) => x.type === "Credit Card")
    .sort(
      (a, b) =>
        cycle
          .filter((x) => x.payment.account._id === a._id)
          .filter((x) => !x.isPaid)
          .reduce((sum, x) => sum + Math.max(0, x.amount), a.currentBalance) -
        cycle
          .filter((x) => x.payment.account._id === b._id)
          .filter((x) => !x.isPaid)
          .reduce((sum, x) => sum + Math.max(0, x.amount), b.currentBalance)
    )
  let toAccount: IAccount = null
  let payableDebt = 0
  let payAmount = 0
  if (cca.length > 0 && availableToPay > 0) {
    toAccount = cca.shift()
    payableDebt = cycle
      .filter((x) => x.payment.account._id === toAccount._id)
      .filter((x) => !x.isPaid)
      .reduce((sum, x) => sum + Math.max(0, x.amount), toAccount.currentBalance)
    if (payableDebt < 0) {
      payAmount = Math.min(availableToPay, Math.abs(payableDebt))
    }
  }

  function handleClick() {
    props.onClick({
      paidTo: "",
      account: props.account._id,
      account2: toAccount._id,
      amount: -payAmount,
      repeatsOnDaysOfMonth: null,
      repeatsOnMonthsOfYear: null,
      repeatsUntilDate: null,
      repeatsWeekly: null,
      date: moment().format("YYYY-MM-DD"),
      isTransfer: true,
    })
  }

  return (
    <>
      {toAccount !== null &&
      props.account.type === "Checking Account" &&
      availableToPay > 0 &&
      payAmount > 0 ? (
        <div>
          <br />
          <Link href="javascript:;" onClick={handleClick}>
            ** Pay {formatMoney(payAmount)} to {toAccount.name} **
          </Link>
        </div>
      ) : null}
    </>
  )
}
