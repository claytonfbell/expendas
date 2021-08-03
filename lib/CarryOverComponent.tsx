import React from "react"
import useDebounce from "react-use/lib/useDebounce"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { useUpdateAccount } from "./api/api"
import { ItemWithIncludes } from "./ItemWithIncludes"

interface Props {
  account: AccountWithIncludes
  date: string
  endDate: string
  items: ItemWithIncludes[]
  isCurrentCycle: boolean
}
export function CarryOverComponent({
  account,
  date,
  endDate,
  items,
  isCurrentCycle,
}: Props) {
  const { mutateAsync: updateAccount } = useUpdateAccount()

  const carryOver = account.carryOver.filter((x) => x.date === date)
  let startingBalance: number = account.balance
  if (carryOver.length > 0 && !isCurrentCycle) {
    startingBalance = carryOver.shift()?.amount || 0
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
            { id: 0, accountId: account.id, date: endDate, amount: value },
          ],
        })
      }
    },
    500,
    [value, account.id, endDate, lastValue]
  )

  return <></>
}
