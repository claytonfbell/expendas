import moment from "moment"
import { IPayment, IPaymentPopulated } from "../db/Payment"

type ScheduleFeedback = {
  description: string
  errors: string[]
}

export function getRepeatingPaymentFeedback(
  schedule: IPayment | IPaymentPopulated
): ScheduleFeedback {
  let msg: string = moment(schedule.date).format("l")
  // repeating on dates
  if (schedule.repeatsOnDaysOfMonth !== null) {
    msg =
      schedule.repeatsOnDaysOfMonth
        .map((x) => moment.localeData().ordinal(x))
        .join(", ") + " of "
    if (
      schedule.repeatsOnMonthsOfYear === null ||
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
    (schedule.repeatsOnDaysOfMonth !== null ||
      schedule.repeatsWeekly !== null) &&
    schedule.repeatsUntilDate !== null
  ) {
    msg += ` until ${moment(schedule.repeatsUntilDate).format("M/D/YYYY")}`
  }

  // errors
  let errors = []
  if (schedule.repeatsOnDaysOfMonth !== null) {
    const invalidDates = [29, 30, 31]
    errors = schedule.repeatsOnDaysOfMonth
      .map((x) =>
        invalidDates.includes(x)
          ? `Invalid repeating date **${moment.localeData().ordinal(x)}**`
          : undefined
      )
      .filter((x) => x !== undefined)
  }

  return {
    description: msg,
    errors,
  }
}
