import { Payment } from "@prisma/client"
import moment, { Moment } from "moment"

export function filterPaymentsOnDate(payments: Payment[], date: Moment) {
  return payments.filter((x) => {
    // expired
    if (x.repeatsUntilDate !== null) {
      if (moment(x.repeatsUntilDate).isBefore(date)) {
        return false
      }
    }
    // same day
    if (moment(x.date).format("YYYYMMDD") === date.format("YYYYMMDD")) {
      return true
    }
    // repeating on dates
    if (x.repeatsOnDaysOfMonth.length > 0) {
      // not yet
      if (moment(x.date).isAfter(date)) {
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
      if (moment(x.date).isAfter(date)) {
        return false
      }

      const cursor = moment(x.date)
      while (!cursor.isAfter(date)) {
        const sameDate =
          moment(cursor).format("YYYYMMDD") === date.format("YYYYMMDD")
        if (sameDate) {
          return true
        }
        cursor.add(x.repeatsWeekly, "weeks")
      }
    }

    return false
  })
}
