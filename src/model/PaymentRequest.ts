import { DayOfMonth, MonthOfYear } from "./Payment"

export default interface PaymentRequest {
  id?: string
  account: string
  amount: number
  paidTo: string
  when: string
  repeatsUntil: string | null
  repeatsOnDaysOfMonth: DayOfMonth[] | null
  repeatsOnMonthsOfYear: MonthOfYear[] | null
  repeatsWeekly: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null
}
