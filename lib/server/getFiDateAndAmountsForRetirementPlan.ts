import { RetirementPlan, RetirementPlanUser, User } from "@prisma/client"
import moment, { Moment } from "moment"
import { adjustForInflation } from "./adjustForInflation"

export async function getFiDateAndAmountsForRetirementPlan(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  }
) {
  const dateAndAmounts: { date: string; amount: number }[] = []

  // get date of when youngest user turns 70
  const users = retirementPlan.retirementPlanUsers.map((rpu) => rpu.user)
  const youngestUser = users.reduce(
    (youngest, user) => {
      if (
        !youngest ||
        (user.dateOfBirth &&
          youngest.dateOfBirth &&
          user.dateOfBirth > youngest.dateOfBirth)
      ) {
        return user
      }
      return youngest
    },
    null as User | null
  )

  if (youngestUser && youngestUser.dateOfBirth) {
    const month = moment(youngestUser.dateOfBirth)
      .add(70, "years")
      .startOf("month")

    const currentMonth = moment().startOf("month")
    while (month.isAfter(currentMonth)) {
      const amount = await getFiAmountForRetirementPlanOnDate(
        retirementPlan,
        month
      )
      month.subtract(1, "month")

      dateAndAmounts.push({
        date: month.format("YYYY-MM-DD"),
        amount,
      })
    }
  }

  return dateAndAmounts
}

async function getFiAmountForRetirementPlanOnDate(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  },
  date: Moment
) {
  // TODO - need to estimate taxes also

  // get total social security income (when both collecting)
  let annualSocialSecurityIncome = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const user = rpu.user
    if (user.socialSecurityEstimates) {
      const sse = adjustForInflation(
        user.socialSecurityEstimates[rpu.collectSocialSecurityAge - 62],
        date,
        retirementPlan.inflationRateEstimate
      )
      annualSocialSecurityIncome += sse * 12
    }
  }

  const requiredPortfolioIncome =
    adjustForInflation(
      retirementPlan.desiredIncome,
      date,
      retirementPlan.inflationRateEstimate
    ) - annualSocialSecurityIncome
  const withdrawalRate = retirementPlan.withdrawalRateEstimate / 100000
  const amount = requiredPortfolioIncome / withdrawalRate

  // social security gap
  let totalSocialSecurityGap = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const socialSecurityStartAge = rpu.collectSocialSecurityAge
    const socialSecurityStartDate = moment(
      `${rpu.user.dateOfBirth} 00:00:00`
    ).add(socialSecurityStartAge, "years")

    if (socialSecurityStartDate.isAfter(date)) {
      const loopDate = date.clone()
      while (loopDate.isBefore(socialSecurityStartDate)) {
        const sse = adjustForInflation(
          rpu.user.socialSecurityEstimates[rpu.collectSocialSecurityAge - 62],
          loopDate,
          retirementPlan.inflationRateEstimate
        )
        totalSocialSecurityGap += sse
        loopDate.add(1, "month")
      }
    }
  }

  // health insurance gap
  let totalHealthInsuranceGap = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const medicareStartDate = moment(`${rpu.user.dateOfBirth} 00:00:00`).add(
      65,
      "years"
    )
    if (medicareStartDate.isAfter(date)) {
      const loopDate = date.clone()
      while (loopDate.isBefore(medicareStartDate)) {
        totalHealthInsuranceGap += adjustForInflation(
          retirementPlan.healthInsuranceEstimate,
          loopDate,
          retirementPlan.inflationRateEstimate
        )
        loopDate.add(1, "month")
      }
    }
  }
  return amount + totalSocialSecurityGap + totalHealthInsuranceGap
}
