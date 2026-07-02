import { Payment } from "@prisma/client"
import dayjs, { Dayjs } from "../dayjs"

export function filterPaymentsOnDate(payments: Payment[], date: Dayjs) {
  return payments.filter((x) => {
    // expired
    if (x.repeatsUntilDate !== null) {
      if (dayjs(x.repeatsUntilDate).isBefore(date)) {
        return false
      }
    }
    // same day
    if (dayjs(x.date).format("YYYYMMDD") === date.format("YYYYMMDD")) {
      return true
    }

    // repeating on dates
    if (x.repeatsOnDates.length > 0) {
      if (x.repeatsOnDates.includes(date.format("YYYY-MM-DD"))) {
        return true
      }
    }

    // repeating on days of month
    if (x.repeatsOnDaysOfMonth.length > 0) {
      // not yet
      if (dayjs(x.date).isAfter(date)) {
        return false
      }

      const onDayOfMonth = x.repeatsOnDaysOfMonth.includes(date.date())
      if (x.repeatsOnMonthsOfYear.length > 0) {
        const onMonthOfYear = x.repeatsOnMonthsOfYear.includes(date.month())
        return onDayOfMonth && onMonthOfYear
      } else {
        return onDayOfMonth
      }
    }
    // repeating weekly
    if (x.repeatsWeekly !== null) {
      // not yet
      if (dayjs(x.date).isAfter(date)) {
        return false
      }

      let cursor = dayjs(x.date)
      while (!cursor.isAfter(date)) {
        const sameDate =
          dayjs(cursor).format("YYYYMMDD") === date.format("YYYYMMDD")
        if (sameDate) {
          return true
        }
        cursor = cursor.add(x.repeatsWeekly, "weeks")
      }
    }

    return false
  })
}
