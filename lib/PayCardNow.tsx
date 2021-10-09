/* eslint-disable prefer-const */
import { Button } from "@mui/material"
import { Account } from "@prisma/client"
import moment from "moment"
import { useFetchAccounts, useFetchItems } from "./api/api"
import { formatMoney } from "./formatMoney"
import { PaymentForm } from "./PaymentForm"

interface Props {
  endingBalance: number
  account: Account
  onClick: (payment: PaymentForm) => void
  date: string
}

export function PayCardNow(props: Props) {
  const { data: accounts = [] } = useFetchAccounts()
  const { data: cycle = [] } = useFetchItems(props.date)

  // find checking account ending balance
  const availableToPay = props.endingBalance - 20000

  // find largest credit card debt
  const cca = accounts
    .filter((x) => x.accountType === "Credit_Card")
    .sort(
      (a, b) =>
        cycle
          .filter((x) => x.payment.account.id === a.id)
          .filter((x) => !x.isPaid)
          .reduce((sum, x) => sum + Math.max(0, x.amount), a.balance) -
        cycle
          .filter((x) => x.payment.account.id === b.id)
          .filter((x) => !x.isPaid)
          .reduce((sum, x) => sum + Math.max(0, x.amount), b.balance)
    )
  let toAccount: Account | null = null
  let payableDebt = 0
  let payAmount = 0
  if (cca.length > 0 && availableToPay > 0) {
    toAccount = cca.shift() as Account
    payableDebt = cycle
      .filter((x) => x.payment.account.id === toAccount?.id)
      .filter((x) => !x.isPaid)
      .reduce((sum, x) => sum + Math.max(0, x.amount), toAccount.balance)
    if (payableDebt < 0) {
      payAmount = Math.min(availableToPay, Math.abs(payableDebt))
    }
  }

  function handleClick() {
    props.onClick({
      id: 0,
      isPaycheck: false,
      description: "",
      accountId: props.account.id,
      accountId2: toAccount?.id,
      amount: -payAmount,
      repeatsOnDates: [],
      repeatsOnDaysOfMonth: [],
      repeatsOnMonthsOfYear: [],
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
      props.account.accountType === "Checking_Account" &&
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
