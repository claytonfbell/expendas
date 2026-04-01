import moment from "moment"
import prisma from "./prisma"

export async function updateAccountBalanceHistory(organizationId: number) {
  const accounts = await prisma.account.findMany({
    where: {
      organizationId,
    },
  })

  const today = moment().tz("America/Los_Angeles").format("YYYY-MM-DD")
  const existingRows = await prisma.accountBalanceHistory.findMany({
    where: {
      accountId: {
        in: accounts.map((a) => a.id),
      },
      date: today,
    },
  })
  const existingMap = new Map<number, (typeof existingRows)[0]>(
    existingRows.map((row) => [row.accountId, row])
  )
  for (const account of accounts) {
    const existing = existingMap.get(account.id)
    if (existing) {
      await prisma.accountBalanceHistory.update({
        where: {
          id: existing.id,
        },
        data: {
          balance: account.balance,
        },
      })
    } else {
      await prisma.accountBalanceHistory.create({
        data: {
          accountId: account.id,
          balance: account.balance,
          date: today,
        },
      })
    }
  }
}
