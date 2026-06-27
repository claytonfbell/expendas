import { RetirementPlan, RetirementPlanUser, User } from "@prisma/client"
import dayjs, { Dayjs } from "../dayjs"
import { adjustForInflation } from "./adjustForInflation"

type FiDateAndAmounts = {
  date: string
  amount: number
  selfFundedSocialSecurityAmount: number
  selfFundedHealthInsuranceAmount: number
  selfFundedTotalMonths: number
}

export async function getFiDateAndAmountsForRetirementPlan(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  }
) {
  const dateAndAmounts: FiDateAndAmounts[] = []

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
    let month = dayjs(youngestUser.dateOfBirth)
      .add(70, "years")
      .startOf("month")

    const currentMonth = dayjs().startOf("month")
    while (month.isAfter(currentMonth)) {
      const fiDateAndAmounts = await getFiAmountForRetirementPlanOnDate(
        retirementPlan,
        month
      )
      month = month.subtract(1, "month")

      dateAndAmounts.push(fiDateAndAmounts)
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
  date: Dayjs
): Promise<FiDateAndAmounts> {
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

  /**
   * selfFundedTotalMonths should be the total number of months after "date" until all users are receiving social security and medicare, which represents the months where the user is fully self-funding those gaps. This is a useful number to understand how long the user is in the "most difficult" part of retirement, where they don't have social security or medicare kicking in yet.
   */
  let selfFundedTotalMonths = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const socialSecurityStartAge = rpu.collectSocialSecurityAge
    const socialSecurityStartDate = dayjs(
      `${rpu.user.dateOfBirth} 00:00:00`
    ).add(socialSecurityStartAge, "years")

    const medicareStartDate = dayjs(`${rpu.user.dateOfBirth} 00:00:00`).add(
      65,
      "years"
    )

    const userSelfFundedEndDate = socialSecurityStartDate.isAfter(
      medicareStartDate
    )
      ? socialSecurityStartDate
      : medicareStartDate
    if (userSelfFundedEndDate.isAfter(date)) {
      const months = userSelfFundedEndDate.diff(date, "months")
      selfFundedTotalMonths = Math.max(selfFundedTotalMonths, months)
    }
  }

  // social security gap
  let totalSocialSecurityGap = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const socialSecurityStartAge = rpu.collectSocialSecurityAge
    const socialSecurityStartDate = dayjs(
      `${rpu.user.dateOfBirth} 00:00:00`
    ).add(socialSecurityStartAge, "years")

    if (socialSecurityStartDate.isAfter(date)) {
      let loopDate = date.clone()
      while (loopDate.isBefore(socialSecurityStartDate)) {
        const sse = adjustForInflation(
          rpu.user.socialSecurityEstimates[rpu.collectSocialSecurityAge - 62],
          loopDate,
          retirementPlan.inflationRateEstimate
        )
        totalSocialSecurityGap += sse
        loopDate = loopDate.add(1, "month")
      }
    }
  }

  // health insurance gap
  let totalHealthInsuranceGap = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const medicareStartDate = dayjs(`${rpu.user.dateOfBirth} 00:00:00`).add(
      65,
      "years"
    )
    if (medicareStartDate.isAfter(date)) {
      let loopDate = date.clone()
      while (loopDate.isBefore(medicareStartDate)) {
        totalHealthInsuranceGap += adjustForInflation(
          retirementPlan.healthInsuranceEstimate,
          loopDate,
          retirementPlan.inflationRateEstimate
        )
        loopDate = loopDate.add(1, "month")
      }
    }
  }
  return {
    date: date.format("YYYY-MM-DD"),
    amount: amount + totalSocialSecurityGap + totalHealthInsuranceGap,
    selfFundedSocialSecurityAmount: totalSocialSecurityGap,
    selfFundedHealthInsuranceAmount: totalHealthInsuranceGap,
    selfFundedTotalMonths,
  }
}
