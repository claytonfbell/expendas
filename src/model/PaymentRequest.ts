import { Biweekly, DayOfMonth, MonthOfYear, Weekly } from "./Payment"

export default interface PaymentRequest {
  account: string
  amount: number
  paidTo: string
  when: string
  repeatsUntil: string | null
  repeatsOnDaysOfMonth: DayOfMonth[] | null
  repeatsOnMonthsOfYear: MonthOfYear[] | null
  repeatsWeekly: Weekly | Biweekly | null
}
