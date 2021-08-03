import { Payment } from "@prisma/client"
import moment from "moment"

type ScheduleFeedback = {
  description: string
  errors: string[]
}

export function getRepeatingPaymentFeedback(
  schedule: Payment | undefined
): ScheduleFeedback {
  let errors: string[] = []
  let msg: string = ""
  if (schedule !== undefined) {
    msg = moment(schedule.date).format("l")
    // repeating on dates
    if (schedule.repeatsOnDaysOfMonth.length > 0) {
      msg =
        schedule.repeatsOnDaysOfMonth
          .map((x) => moment.localeData().ordinal(x))
          .join(", ") + " of "
      if (
        schedule.repeatsOnMonthsOfYear.length === 0 ||
        schedule.repeatsOnMonthsOfYear.length === 12
      ) {
        msg += "each month"
      } else {
        msg += schedule.repeatsOnMonthsOfYear
          .map((x) => moment().month(x).format("MMMM"))
          .join(", ")
      }
    }
    // repeating weekly / biweekly
    else if (schedule.repeatsWeekly !== null) {
      msg =
        moment(schedule.date).format("dddd") +
        (schedule.repeatsWeekly === 1
          ? " each week"
          : ` every ${schedule.repeatsWeekly} weeks`)
    }

    // repeats until
    if (
      (schedule.repeatsOnDaysOfMonth.length > 0 ||
        schedule.repeatsWeekly !== null) &&
      schedule.repeatsUntilDate !== null
    ) {
      msg += ` until ${moment(schedule.repeatsUntilDate).format("M/D/YYYY")}`
    }

    // errors
    if (schedule.repeatsOnDaysOfMonth.length > 0) {
      const invalidDates = [29, 30, 31]
      errors = schedule.repeatsOnDaysOfMonth
        .map((x) =>
          invalidDates.includes(x)
            ? `Invalid repeating date **${moment.localeData().ordinal(x)}**`
            : ""
        )
        .filter((x) => x !== "")
    }
  }
  return {
    description: msg,
    errors,
  }
}
