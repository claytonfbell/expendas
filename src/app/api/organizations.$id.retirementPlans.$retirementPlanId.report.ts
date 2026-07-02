import { RetirementPlan, RetirementPlanUser, User } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import dayjs, { Dayjs } from "../../../lib/dayjs"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { adjustForInflation } from "../../../lib/server/adjustForInflation"
import { buildResponse } from "../../../lib/server/buildResponse"
import { getFiDateAndAmountsForRetirementPlan } from "../../../lib/server/getFiDateAndAmountsForRetirementPlan"
import {
  getRetirementPlanProjection,
  ProjectionRow,
} from "../../../lib/server/getRetirementPlanProjection"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/retirementPlans/$retirementPlanId/report"
)({
  server: {
    handlers: {  
    GET: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const retirementPlanId = Number(params.retirementPlanId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const retirementPlan = await prisma.retirementPlan.findUnique({
          where: {
            id: retirementPlanId,
          },
          include: {
            retirementPlanUsers: {
              include: {
                user: true,
              },
            },
            retirementPlanContributions: {
              include: {
                account: true,
              },
            },
          },
        })
        validate({ retirementPlan }).notNull()
  
        if (retirementPlan !== null) {
          let projectionRows = await getRetirementPlanProjection(retirementPlan)
  
          const dateAndAmounts =
            await getFiDateAndAmountsForRetirementPlan(retirementPlan)
  
          const fiRow = projectionRows.find((row) => {
            const dateAndAmount = dateAndAmounts.find(
              (da) => da.date === row.date
            )!
            return row.endingBalance > dateAndAmount.amount
          })
  
          const {
            selfFundedSocialSecurityAmount,
            selfFundedHealthInsuranceAmount,
            selfFundedTotalMonths,
          } = dateAndAmounts.find((da) => da.date === fiRow!.date) ?? {
            selfFundedSocialSecurityAmount: 0,
            selfFundedHealthInsuranceAmount: 0,
            selfFundedTotalMonths: 0,
          }
  
          let prevRow: ProjectionRow | null = null
          projectionRows = projectionRows.map((row) => {
            const isDecumulation = fiRow ? row.date >= fiRow.date : false
            if (!isDecumulation) {
              return row
            } else {
              const month = dayjs(`${row.date} 00:00:00`)
              let withdraw = adjustForInflation(
                Math.round(retirementPlan.desiredIncome / 12),
                month,
                retirementPlan.inflationRateEstimate
              )
              withdraw += getHealthInsuranceForMonth(retirementPlan, month)
              withdraw -= getSocialSecurityForMonth(retirementPlan, month)
  
              const newRow = { ...row }
              newRow.accounts = newRow.accounts
                .sort((a, b) => {
                  const bucketOrder = {
                    After_Tax: 0,
                    Traditional: 1,
                    Roth_And_HSA: 2,
                  }
                  return (
                    bucketOrder[a.accountBucket] - bucketOrder[b.accountBucket]
                  )
                })
                .map((account) => {
                  const startingBalance = prevRow
                    ? prevRow.accounts.find(
                        (a) => a.accountId === account.accountId
                      )!.endingBalance
                    : account.startingBalance
  
                  const dividend =
                    month.month() % 3 === 0
                      ? Math.round(
                          (startingBalance *
                            (retirementPlan.dividendYieldEstimate / 100000)) /
                            4
                        )
                      : 0
  
                  const appreciation = Math.round(
                    (startingBalance *
                      (retirementPlan.stockAppreciationEstimate / 100000)) /
                      12
                  )
  
                  let amountToTakeOutOfAccount = Math.max(
                    0,
                    Math.min(withdraw, startingBalance)
                  )
  
                  const tax = 0
                  amountToTakeOutOfAccount += tax
                  withdraw -= amountToTakeOutOfAccount
                  const contribution = -amountToTakeOutOfAccount
  
                  const endingBalance =
                    startingBalance + contribution + appreciation + dividend
                  return {
                    ...account,
                    startingBalance,
                    appreciation,
                    dividend,
                    contribution,
                    endingBalance,
                  }
                })
  
              newRow.startingBalance = newRow.accounts.reduce(
                (sum, account) => sum + account.startingBalance,
                0
              )
              newRow.contribution = newRow.accounts.reduce(
                (sum, account) => sum + account.contribution,
                0
              )
              newRow.appreciation = newRow.accounts.reduce(
                (sum, account) => sum + account.appreciation,
                0
              )
              newRow.dividend = newRow.accounts.reduce(
                (sum, account) => sum + account.dividend,
                0
              )
              newRow.endingBalance = newRow.accounts.reduce(
                (sum, account) => sum + account.endingBalance,
                0
              )
  
              prevRow = newRow
              return newRow
            }
          })
  
          const annualProjectionRows: ProjectionRow[][] = []
          let currentMonth = dayjs(`${projectionRows[0].date} 00:00:00`)
          let currentYearRows: ProjectionRow[] = []
          projectionRows.forEach((row) => {
            const month = dayjs(`${row.date} 00:00:00`)
            if (month.isSameOrAfter(currentMonth.clone().add(1, "year"))) {
              annualProjectionRows.push(currentYearRows)
              currentMonth = month.clone()
              currentYearRows = []
            }
            currentYearRows.push(row)
          })
          if (currentYearRows.length > 0) {
            annualProjectionRows.push(currentYearRows)
          }
          projectionRows = annualProjectionRows.map((yearRows) => {
            const accounts = yearRows[0].accounts.map((account) => {
              const startingBalance = yearRows[0].accounts.find(
                (a) => a.accountId === account.accountId
              )!.startingBalance
              const contribution = yearRows.reduce(
                (sum, r) =>
                  sum +
                  r.accounts.find((a) => a.accountId === account.accountId)!
                    .contribution,
                0
              )
              const appreciation = yearRows.reduce(
                (sum, r) =>
                  sum +
                  r.accounts.find((a) => a.accountId === account.accountId)!
                    .appreciation,
                0
              )
              const dividend = yearRows.reduce(
                (sum, r) =>
                  sum +
                  r.accounts.find((a) => a.accountId === account.accountId)!
                    .dividend,
                0
              )
              const endingBalance =
                startingBalance + contribution + appreciation + dividend
  
              return {
                accountId: account.accountId,
                accountBucket: account.accountBucket,
                startingBalance,
                contribution,
                appreciation,
                dividend,
                endingBalance,
              }
            })
  
            const row: ProjectionRow = {
              date: yearRows[0].date,
              accounts: accounts,
              startingBalance: accounts.reduce(
                (sum, account) => sum + account.startingBalance,
                0
              ),
              contribution: accounts.reduce(
                (sum, account) => sum + account.contribution,
                0
              ),
              appreciation: accounts.reduce(
                (sum, account) => sum + account.appreciation,
                0
              ),
              dividend: accounts.reduce(
                (sum, account) => sum + account.dividend,
                0
              ),
              endingBalance: accounts.reduce(
                (sum, account) => sum + account.endingBalance,
                0
              ),
            }
            return row
          })
  
          const resp: RetirementPlanReportResponse = {
            projectionRows,
            fiDate: fiRow!,
            selfFundedSocialSecurityAmount,
            selfFundedHealthInsuranceAmount,
            selfFundedTotalMonths,
          }
          return resp
        } else {
          throw new Error("Retirement plan not found")
        }
      })
    },
  
    }
  }
})

export type RetirementPlanReportResponse = {
  projectionRows: ProjectionRow[]
  fiDate: ProjectionRow
  selfFundedSocialSecurityAmount: number
  selfFundedHealthInsuranceAmount: number
  selfFundedTotalMonths: number
}

function getSocialSecurityForMonth(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  },
  date: Dayjs
) {
  let totalSocialSecurity = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const socialSecurityStartAge = rpu.collectSocialSecurityAge
    const socialSecurityStartDate = dayjs(
      `${rpu.user.dateOfBirth} 00:00:00`
    ).add(socialSecurityStartAge, "years")
    if (socialSecurityStartDate.isSameOrBefore(date)) {
      const sse = adjustForInflation(
        rpu.user.socialSecurityEstimates[rpu.collectSocialSecurityAge - 62],
        date,
        retirementPlan.inflationRateEstimate
      )
      totalSocialSecurity += sse
    }
  }
  return totalSocialSecurity
}

function getHealthInsuranceForMonth(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  },
  date: Dayjs
) {
  let totalHealthInsurance = 0
  for (const rpu of retirementPlan.retirementPlanUsers) {
    const medicareStartAge = 65
    if (
      dayjs(`${rpu.user.dateOfBirth} 00:00:00`)
        .add(medicareStartAge, "years")
        .isSameOrBefore(date)
    ) {
      const healthInsuranceCost = adjustForInflation(
        retirementPlan.healthInsuranceEstimate,
        date,
        retirementPlan.inflationRateEstimate
      )
      totalHealthInsurance += healthInsuranceCost
    }
  }
  return totalHealthInsurance
}
