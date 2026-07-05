import prisma from "./prisma"
import { getLatestTickerPrice } from "./tickerPrices"
import { recalculateAccountBalance } from "./recalculateAccountBalance"

export async function autoUpdateInvestmentAccountBalances() {
  console.log("Running autoUpdateInvestmentAccountBalances")

  const investmentAccounts = await prisma.account.findMany({
    where: {
      accountType: "Investment",
    },
    include: {
      assets: true,
    },
  })

  const accountsWithAssets = investmentAccounts.filter(
    (account) => account.assets.length > 0
  )

  console.log(
    `Found ${accountsWithAssets.length} investment accounts with assets`
  )

  const allTickers = [
    ...new Set(
      accountsWithAssets.flatMap((a) => a.assets.map((asset) => asset.ticker))
    ),
  ]

  const latestPrices = new Map<string, number>()
  for (const ticker of allTickers) {
    const price = await getLatestTickerPrice(ticker)
    if (price) {
      latestPrices.set(ticker, price.price)
    }
  }

  for (const account of accountsWithAssets) {
    let needsUpdate = false

    for (const asset of account.assets) {
      const newPrice = latestPrices.get(asset.ticker)
      if (newPrice && asset.tickerPrice !== newPrice) {
        const newBalance = Math.round(
          (asset.balance / asset.tickerPrice) * newPrice
        )
        await prisma.asset.update({
          where: { id: asset.id },
          data: {
            tickerPrice: newPrice,
            balance: newBalance,
          },
        })
        needsUpdate = true
      }
    }

    if (needsUpdate) {
      console.log(`Updating balance for account ${account.id}`)
      await recalculateAccountBalance(account.id)
    }
  }
}