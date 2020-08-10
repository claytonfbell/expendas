import moment from "moment"
import { CycleService } from "."
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import ExpendasSessionData from "../../../src/model/ExpendasSessionData"
import Household from "../../../src/model/Household"
import Payment, { DayOfMonth, MonthOfYear } from "../../../src/model/Payment"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        // move this to middleware
        const sessionData: ExpendasSessionData = req.session.data
        const household = await Household.findOne({
          _id: sessionData.householdId,
        })

        const {
          query: { startDate },
        } = req

        // find cycle end date
        const rangeStart = moment(startDate)
        let rangeEnd = moment(startDate).add(6, "months")
        const cycles = await new CycleService().getCyclesWithHousehold(
          household,
          rangeStart,
          rangeEnd
        )
        // next cycle
        rangeEnd = moment(cycles[1])

        // get all relevant payments
        const allPayments = await Payment.find({
          household: household._id,
        }).populate("account")

        const cyclePayments = allPayments.filter((x) => {
          // expired
          if (
            x.repeatsUntil != null &&
            moment(x.repeatsUntil).isBefore(rangeStart)
          ) {
            return false
          }
          // day in range
          if (
            !moment(x.when).isBefore(rangeStart) &&
            moment(x.when).isBefore(rangeEnd)
          ) {
            return true
          }
          // repeating on dates
          if (x.repeatsOnDaysOfMonth !== null) {
            const cursor = moment(rangeStart)
            while (cursor.isBefore(rangeEnd)) {
              const onDayOfMonth = x.repeatsOnDaysOfMonth.includes(
                cursor.date() as DayOfMonth
              )
              if (x.repeatsOnMonthsOfYear !== null) {
                const onMonthOfYear = x.repeatsOnMonthsOfYear.includes(
                  cursor.month() as MonthOfYear
                )
                if (onDayOfMonth && onMonthOfYear) {
                  return true
                }
              } else {
                if (onDayOfMonth) {
                  return true
                }
              }
              cursor.add(1, "days")
            }
          }
          // weekly
          if (x.repeatsWeekly !== null) {
            const cursor = moment(rangeStart)
            while (cursor.isBefore(rangeEnd)) {
              const c2 = moment(x.when)
              while (!c2.isAfter(cursor)) {
                const sameDate =
                  moment(c2).format("YYYYMMDD") === cursor.format("YYYYMMDD")
                if (sameDate) {
                  return true
                }
                c2.add(x.repeatsWeekly, "weeks")
              }
              cursor.add(1, "days")
            }
          }
          return false
        })

        return cyclePayments.sort(
          (a, b) => Math.abs(b.amount) - Math.abs(a.amount)
        )
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
