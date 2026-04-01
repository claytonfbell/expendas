import moment from "moment"
import prisma from "./prisma"
import {
  getAllTimeHighTickerPrice,
  getTwoYearLowTickerPrice,
} from "./tickerPrices"

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

  const marketHighPrice = (await getAllTimeHighTickerPrice())!.price
  const marketLowPrice = (await getTwoYearLowTickerPrice())!.price

  for (const account of accounts) {
    // calculate marketHigh and marketLow
    const fixedIncome = account.totalFixedIncome ?? 0
    const currentPrice = account.tickerPrice ?? 0
    const shares = (account.balance - fixedIncome) / currentPrice
    const marketHigh =
      account.accountType === "Investment"
        ? Math.round(shares * marketHighPrice + fixedIncome)
        : null
    const marketLow =
      account.accountType === "Investment"
        ? Math.round(shares * marketLowPrice + fixedIncome)
        : null

    console.log(
      `account ${account.id}: marketHigh: ${marketHigh}, marketLow: ${marketLow}`
    )

    const existing = existingMap.get(account.id)
    if (existing) {
      await prisma.accountBalanceHistory.update({
        where: {
          id: existing.id,
        },
        data: {
          balance: account.balance,
          fixedIncome: account.totalFixedIncome ?? 0,
          marketHigh,
          marketLow,
        },
      })
    } else {
      await prisma.accountBalanceHistory.create({
        data: {
          accountId: account.id,
          balance: account.balance,
          fixedIncome: account.totalFixedIncome ?? 0,
          marketHigh,
          marketLow,
          date: today,
        },
      })
    }
  }
}
