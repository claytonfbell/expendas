import dayjs, { Dayjs } from "../dayjs"

export function adjustForInflation(
  amount: number,
  toDate: Dayjs,
  inflationRate: number
) {
  const currentDate = dayjs()
  const monthsDifference = toDate.diff(currentDate, "months")
  const monthlyInflationRate = inflationRate / 100000 / 12
  return Math.round(
    amount * Math.pow(1 + monthlyInflationRate, monthsDifference)
  )
}
