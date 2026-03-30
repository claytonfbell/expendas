import prisma from "./prisma"
import { getLatestTickerPrice } from "./tickerPrices"

export async function autoUpdateInvestmentAccountBalances() {
  const latestTickerPrice = await getLatestTickerPrice()

  // get investment accounts
  const investmentAccounts = await prisma.account.findMany({
    where: {
      accountType: "Investment",
      tickerPrice: {
        not: null,
      },
    },
  })

  for (const account of investmentAccounts) {
    if (
      account.tickerPrice &&
      latestTickerPrice &&
      account.tickerPrice !== latestTickerPrice.price
    ) {
      // calculate number of shares based on old price
      const equityBalance = account.balance - (account.totalFixedIncome ?? 0)
      const numShares = equityBalance / account.tickerPrice
      // calculate new balance based on latest price
      const newBalance =
        numShares * latestTickerPrice.price + (account.totalFixedIncome ?? 0)

      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: Math.round(newBalance),
          tickerPrice: latestTickerPrice.price,
        },
      })
    } else {
      console.log(
        `skipping account ${account.id} because ticker price is already up to date`
      )
    }
  }
}
