import moment, { Moment } from "moment-timezone"
import { MethodNotAllowedException } from "../../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../../src/middleware/applyMiddleware"
import { IAccount } from "../../../src/model/Account"
import { IHousehold } from "../../../src/model/Household"
import Payment, {
  DayOfMonth,
  IPayment,
  MonthOfYear,
} from "../../../src/model/Payment"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "GET":
        const rangeStart: Moment = moment()
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .subtract(1, "months")
        const rangeEnd: Moment = moment()
          .hour(0)
          .minute(0)
          .second(0)
          .millisecond(0)
          .add(6, "months")

        const cycles = await new CycleService().getCyclesWithHousehold(
          req.household,
          rangeStart,
          rangeEnd
        )
        return cycles
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}

export class CycleService {
  async getCyclesWithHousehold(
    household: IHousehold,
    rangeStart: Moment,
    rangeEnd: Moment
  ) {
    // FETCH ALL PAYMENTS
    const allPayments = await Payment.find({
      household: household._id,
    }).populate("account")

    // FILTER TO GET PAYCHECKS
    const payChecks = allPayments
      .filter((x) => x.amount > 0)
      .filter((x) => {
        const account: IAccount = x.account
        return account.type === "Checking Account"
      })

    const cycles: Moment[] = []
    const cursor = moment(rangeStart)
    while (cursor.isBefore(rangeEnd)) {
      // find paychecks that fall on this date
      const checks = this.filterPaymentsOnDate(payChecks, cursor)
      if (checks.length > 0) {
        cycles.push(moment(cursor))
      }
      cursor.add(1, "days")
    }

    // RETURN ALL THE CYCLE DATES BETWEEN X AND Y
    return cycles.map((x) => x.format("LL"))
  }

  filterPaymentsOnDate(payments: IPayment[], date: Moment) {
    return payments.filter((x) => {
      // expired
      if (x.repeatsUntil !== null) {
        if (moment(x.repeatsUntil).isBefore(date)) {
          return false
        }
      }
      // same day
      if (moment(x.when).format("YYYYMMDD") === date.format("YYYYMMDD")) {
        return true
      }
      // repeating on dates
      if (x.repeatsOnDaysOfMonth !== null) {
        const onDayOfMonth = x.repeatsOnDaysOfMonth.includes(
          date.date() as DayOfMonth
        )
        if (x.repeatsOnMonthsOfYear !== null) {
          const onMonthOfYear = x.repeatsOnMonthsOfYear.includes(
            date.month() as MonthOfYear
          )
          return onDayOfMonth && onMonthOfYear
        } else {
          return onDayOfMonth
        }
      }
      // repeating weekly
      if (x.repeatsWeekly !== null) {
        const cursor = moment(x.when)
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
}
