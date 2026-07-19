import dayjs from "../dayjs"
import prisma from "./prisma"

export async function updateAccountBalanceHistory(organizationId: number) {
  const accounts = await prisma.account.findMany({
    where: {
      organizationId,
    },
    include: {
      assets: true,
    },
  })

  const today = dayjs().tz("America/Los_Angeles").format("YYYY-MM-DD")
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

  const allTickers = [
    ...new Set(accounts.flatMap((a) => a.assets.map((asset) => asset.ticker))),
  ]

  const tickerHighs = new Map<string, number>()
  const tickerLows = new Map<string, number>()

  for (const ticker of allTickers) {
    const allTimeHigh = await prisma.tickerPrice.findFirst({
      where: { ticker, price: { gt: 0 } },
      orderBy: { price: "desc" },
    })
    if (allTimeHigh) tickerHighs.set(ticker, allTimeHigh.price)

    const twoYearsAgo = dayjs().subtract(2, "years").format("YYYY-MM-DD")
    const twoYearLow = await prisma.tickerPrice.findFirst({
      where: { ticker, date: { gte: twoYearsAgo }, price: { gt: 0 } },
      orderBy: { price: "asc" },
    })
    if (twoYearLow) tickerLows.set(ticker, twoYearLow.price)
  }

  for (const account of accounts) {
    let marketHigh: number | null = null
    let marketLow: number | null = null

    if (account.accountType === "Investment" && account.assets.length > 0) {
      marketHigh = account.assets.reduce((sum, asset) => {
        const highPrice = tickerHighs.get(asset.ticker)
        if (highPrice && asset.tickerPrice > 0) {
          return (
            sum + Math.round((asset.balance / asset.tickerPrice) * highPrice)
          )
        }
        return sum + asset.balance
      }, 0)

      marketLow = account.assets.reduce((sum, asset) => {
        const lowPrice = tickerLows.get(asset.ticker)
        if (lowPrice && asset.tickerPrice > 0) {
          return (
            sum + Math.round((asset.balance / asset.tickerPrice) * lowPrice)
          )
        }
        return sum + asset.balance
      }, 0)
    }

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
          marketHigh,
          marketLow,
        },
      })
    } else {
      await prisma.accountBalanceHistory.create({
        data: {
          accountId: account.id,
          balance: account.balance,
          marketHigh,
          marketLow,
          date: today,
        },
      })
    }
  }
}
