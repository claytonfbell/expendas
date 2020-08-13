import { DayOfMonth, MonthOfYear } from "../db/Payment"

export default interface PaymentRequest {
  id?: string
  account: string
  amount: number
  paidTo: string
  date: string
  repeatsUntilDate: string | null
  repeatsOnDaysOfMonth: DayOfMonth[] | null
  repeatsOnMonthsOfYear: MonthOfYear[] | null
  repeatsWeekly: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null
}
