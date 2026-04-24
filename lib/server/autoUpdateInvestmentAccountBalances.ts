import prisma from "./prisma"
import { getLatestTickerPrice } from "./tickerPrices"

export async function autoUpdateInvestmentAccountBalances() {
  console.log("Running autoUpdateInvestmentAccountBalances")
  const latestVooPrice = await getLatestTickerPrice("VOO")
  const latestFbndPrice = await getLatestTickerPrice("FBND")

  // get investment accounts
  const investmentAccounts = await prisma.account.findMany({
    where: {
      accountType: "Investment",
      tickerPrice: {
        gt: 0,
      },
    },
  })

  // 401k and Traditional IRA accounts hold FBND for fixed income,
  // so we want to update those fixed income blances also
  const traditionalAccounts = investmentAccounts.filter(
    (account) => account.accountBucket === "Traditional"
  )

  console.log(
    `Found ${investmentAccounts.length} investment accounts with ticker prices`
  )

  for (const account of investmentAccounts) {
    console.log(`checking account ${account.id} for ticker price updates...`)
    if (
      account.tickerPrice &&
      latestVooPrice &&
      (account.tickerPrice !== latestVooPrice.price ||
        (latestFbndPrice &&
          account.accountBucket === "Traditional" &&
          account.fixedIncomeTickerPrice !== latestFbndPrice.price))
    ) {
      console.log(`updating account ${account.id} with new ticker price...`)

      // update totalFixedIncome for traditional accounts
      let newTotalFixedIncome = account.totalFixedIncome
      if (
        account.totalFixedIncome &&
        account.totalFixedIncome > 0 &&
        account.accountBucket === "Traditional" &&
        account.fixedIncomeTickerPrice !== null &&
        latestFbndPrice
      ) {
        const fixedIncomeShares =
          account.totalFixedIncome / (account.fixedIncomeTickerPrice ?? 1)
        newTotalFixedIncome = Math.round(
          fixedIncomeShares * latestFbndPrice.price
        )
      }

      // calculate number of shares based on old price
      const equityBalance = account.balance - (newTotalFixedIncome ?? 0)
      const numShares = equityBalance / account.tickerPrice
      // calculate new balance based on latest price
      const newBalance =
        numShares * latestVooPrice.price + (newTotalFixedIncome ?? 0)

      console.log("newTotalFixedIncome", newTotalFixedIncome)
      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: Math.round(newBalance),
          tickerPrice: latestVooPrice.price,
          fixedIncomeTickerPrice:
            account.accountBucket === "Traditional" && latestFbndPrice
              ? latestFbndPrice.price
              : null,
          totalFixedIncome: newTotalFixedIncome,
        },
      })
    } else {
      //   console.log(
      //     `skipping account ${account.id} because ticker price is already up to date`
      //   )
    }
  }
}
