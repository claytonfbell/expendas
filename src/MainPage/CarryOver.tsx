import React from "react"
import useDebounce from "react-use/lib/useDebounce"
import { useUpdateAccount } from "../api/accounts"
import { IAccount } from "../db/Account"
import { ICycleItemPopulated } from "../db/CycleItem"

interface Props {
  account: IAccount
  date: string
  endDate: string
  items: ICycleItemPopulated[]
  isCurrentCycle: boolean
}
export function CarryOver({
  account,
  date,
  endDate,
  items,
  isCurrentCycle,
}: Props) {
  const [updateAccount] = useUpdateAccount()

  const carryOver = account.carryOver.filter((x) => x.date === date)
  let startingBalance: number = account.currentBalance
  if (carryOver.length > 0 && !isCurrentCycle) {
    startingBalance = carryOver.shift().balance
  }

  const value =
    startingBalance +
    items.filter((x) => !x.isPaid).reduce((x, y) => x + y.amount, 0)

  const [lastValue, setLastValue] = React.useState(value)

  useDebounce(
    () => {
      if (endDate !== undefined && lastValue !== value) {
        setLastValue(value)
        updateAccount({
          ...account,
          carryOver: [
            ...(account.carryOver === undefined
              ? []
              : account.carryOver.filter((x) => x.date !== endDate)),
            { date: endDate, balance: value },
          ],
        })
      }
    },
    10000,
    [value, account._id, endDate, lastValue]
  )

  return <></>
}
