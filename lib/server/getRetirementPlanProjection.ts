import {
  AccountBucket,
  RetirementPlan,
  RetirementPlanUser,
  User,
} from "@prisma/client"
import moment from "moment"
import prisma from "./prisma"

export type ProjectionRow = {
  date: string
  accounts: ProjectionRowAccount[]
  startingBalance: number
  contribution: number
  appreciation: number
  dividend: number
  endingBalance: number
}

type ProjectionRowAccount = {
  accountId: number
  accountBucket: AccountBucket
  startingBalance: number
  contribution: number
  appreciation: number
  dividend: number
  endingBalance: number
}

export async function getRetirementPlanProjection(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  }
) {
  // get date of when youngest user turns 100
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
    const rows: ProjectionRow[] = []

    const retirementAccounts = await prisma.account.findMany({
      where: {
        organizationId: retirementPlan.organizationId,
        accountBucket: {
          not: null,
        },
        accountType: "Investment",
      },
      include: {
        retirementPlanContributions: {
          where: {
            retirementPlanId: retirementPlan.id,
          },
        },
      },
    })

    const endMonth = moment(youngestUser.dateOfBirth)
      .add(100, "years")
      .startOf("month")

    const month = moment().startOf("month")

    // initial balances
    let prevRow: ProjectionRow = {
      date: month.format("YYYY-MM-DD"),
      accounts: retirementAccounts.map((account) => ({
        accountId: account.id,
        accountBucket: account.accountBucket!,
        startingBalance: account.balance,
        contribution: 0,
        appreciation: 0,
        dividend: 0,
        endingBalance: account.balance,
      })),
      startingBalance: 0,
      contribution: 0,
      appreciation: 0,
      dividend: 0,
      endingBalance: 0,
    }

    while (month.isBefore(endMonth)) {
      month.add(1, "month")

      const accounts: ProjectionRowAccount[] = retirementAccounts.map(
        (account) => {
          const startingBalance = prevRow.accounts.find(
            (a) => a.accountId === account.id
          )!.endingBalance

          // dividends are only in april, july, october, january
          const dividend =
            month.month() % 3 === 0
              ? Math.round(
                  (startingBalance *
                    (retirementPlan.dividendYieldEstimate / 100000)) /
                    4
                )
              : 0

          // calculate appreciation
          const appreciation = Math.round(
            (startingBalance *
              (retirementPlan.stockAppreciationEstimate / 100000)) /
              12
          )
          const contribution = account.retirementPlanContributions.find(
            (c) => c.accountId === account.id
          )!.amount

          const acc: ProjectionRowAccount = {
            accountId: account.id,
            accountBucket: account.accountBucket!,
            startingBalance,
            contribution,
            appreciation,
            dividend,
            endingBalance:
              startingBalance + contribution + appreciation + dividend,
          }
          return acc
        }
      )

      rows.push({
        date: month.format("YYYY-MM-DD"),
        accounts,
        startingBalance: accounts.reduce((a, b) => a + b.startingBalance, 0),
        contribution: accounts.reduce((a, b) => a + b.contribution, 0),
        appreciation: accounts.reduce((a, b) => a + b.appreciation, 0),
        dividend: accounts.reduce((a, b) => a + b.dividend, 0),
        endingBalance: accounts.reduce((a, b) => a + b.endingBalance, 0),
      })
      prevRow = rows[rows.length - 1]
    }
    return rows
  } else {
    throw new Error("No users in retirement plan")
  }
}
