import moment, { Moment } from "moment"

export function adjustForInflation(
  amount: number,
  toDate: Moment,
  inflationRate: number
) {
  const currentDate = moment()
  const monthsDifference = toDate.diff(currentDate, "months")
  const monthlyInflationRate = inflationRate / 100000 / 12
  return Math.round(
    amount * Math.pow(1 + monthlyInflationRate, monthsDifference)
  )
}
