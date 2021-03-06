/* eslint-disable prefer-const */
import { Button } from "@material-ui/core"
import moment from "moment"
import { useFetchAccounts } from "./api/accounts"
import { useFetchCycleItems } from "./api/cycleItems"
import { IAccount } from "./db/Account"
import { formatMoney } from "./shared/formatMoney"
import { PaymentForm } from "./shared/PaymentDialog"

interface Props {
  endingBalance: number
  account: IAccount
  onClick: (payment: PaymentForm) => void
  date: string
}

export default function PayCardNow(props: Props) {
  const { data: accounts } = useFetchAccounts()
  const { data: cycle } = useFetchCycleItems(props.date)

  // find checking account ending balance
  const availableToPay = props.endingBalance - 20000

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
      {/* <div> {toAccount !== null ? toAccount.name : null}</div>
      <div>availableToPay = {availableToPay}</div>
      <div>payableDebt = {payableDebt}</div>
      <div>payAmount = {payAmount}</div> */}
      {toAccount !== null &&
      props.account.type === "Checking Account" &&
      availableToPay > 0 &&
      payAmount > 0 ? (
        <div>
          <br />
          <Button
            disableElevation
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleClick}
          >
            Pay {formatMoney(payAmount)} to {toAccount.name}
          </Button>
        </div>
      ) : null}
    </>
  )
}
