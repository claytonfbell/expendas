import moment, { Moment } from "moment-timezone"
import { filterPaymentsOnDate } from "./filterPaymentsOnDate"
import { BadRequestException } from "./HttpException"
import prisma from "./prisma"

export async function getPaycheckDates(organizationId: number) {
  const dates: Moment[] = []

  // get all paychecks
  const paychecks = await prisma.payment.findMany({
    where: { account: { organizationId }, isPaycheck: true },
  })

  if (paychecks.length === 0) {
    throw new BadRequestException("There are no paychecks setup yet.")
  }

  const rangeStart = moment()
    .subtract(8, "hours")
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .tz("America/Los_Angeles")

  const rangeEnd = moment()
    .subtract(8, "hours")
    .hour(0)
    .minute(0)
    .second(0)
    .millisecond(0)
    .add(12, "months")
    .tz("America/Los_Angeles")
  const minStart = moment().subtract(90, "days")

  let cursor = moment(rangeStart).tz("America/Los_Angeles")

  // GO BACKWARDS TO GET THE CURRENT PAY CYCLE
  while (dates.length === 0 && cursor.isAfter(minStart)) {
    // find paychecks that fall on this date
    const checks = filterPaymentsOnDate(paychecks, cursor)
    if (checks.length > 0) {
      dates.push(moment(cursor))
    }
    cursor.subtract(1, "days")
  }

  // GO FORWARDS
  cursor = moment(rangeStart).tz("America/Los_Angeles")
  cursor.add(1, "days")
  while (cursor.isBefore(rangeEnd)) {
    // find paychecks that fall on this date
    const checks = filterPaymentsOnDate(paychecks, cursor)
    if (checks.length > 0) {
      dates.push(moment(cursor))
    }
    cursor.add(1, "days")
  }

  return dates.map((x) => x.format("YYYY-MM-DD"))
}
