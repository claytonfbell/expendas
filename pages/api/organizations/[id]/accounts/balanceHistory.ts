import moment from "moment"
import { NextApiResponse } from "next"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import {
  getAllTimeHighTickerPrice,
  getTwoYearLowTickerPrice,
} from "../../../../../lib/server/tickerPrices"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "GET") {
      const organizationId = Number(req.query.id)

      const balanceHistory = await prisma.account.findMany({
        where: {
          organizationId,
        },
        include: {
          balanceHistory: {
            select: {
              id: true,
              balance: true,
              fixedIncome: true,
              date: true,
            },
            orderBy: {
              date: "asc",
            },
          },
        },
      })

      // include market high and low for each balance history entry
      const twoYearLowTickerPrice = await getTwoYearLowTickerPrice()
      const allTimeHighTickerPrice = await getAllTimeHighTickerPrice()

      const earliestDate = balanceHistory
        .flatMap((account) => account.balanceHistory)
        .reduce((earliest, entry) => {
          return entry.date < earliest ? entry.date : earliest
        }, moment().format("YYYY-MM-DD"))
      // subract 7 days to be safe
      const earliestDateMinus7 = moment(`${earliestDate} 00:00:00`)
        .subtract(7, "day")
        .format("YYYY-MM-DD")
      const tickerPrices = await prisma.tickerPrice.findMany({
        where: {
          date: {
            gte: earliestDateMinus7,
          },
          ticker: "VOO",
        },
      })
      const tickerPriceMap = new Map<string, number>(
        tickerPrices.map((tp) => [tp.date, tp.price])
      )

      const promises: Promise<any>[] = []

      const balanceHistoryWithMarketHighAndLow = balanceHistory.map(
        (account) => {
          return {
            ...account,
            balanceHistory: account.balanceHistory.map((entry) => {
              // if market is close, check previous days for ticker price, up to 10 days back
              let tickerPrice = tickerPriceMap.get(entry.date)
              let tries = 0
              while (tickerPrice === undefined && tries < 10) {
                tries++
                const previousDate = moment(`${entry.date} 00:00:00`)
                  .subtract(tries, "day")
                  .format("YYYY-MM-DD")
                tickerPrice = tickerPriceMap.get(previousDate)
              }
              const marketLow =
                tickerPrice && twoYearLowTickerPrice
                  ? ((entry.balance - entry.fixedIncome) / tickerPrice) *
                      twoYearLowTickerPrice.price +
                    entry.fixedIncome
                  : null
              const marketHigh =
                tickerPrice && allTimeHighTickerPrice
                  ? ((entry.balance - entry.fixedIncome) / tickerPrice) *
                      allTimeHighTickerPrice.price +
                    entry.fixedIncome
                  : null

              // update the entry with the market high and low
              promises.push(
                new Promise(async (resolve) => {
                  await prisma.accountBalanceHistory.update({
                    where: {
                      id: entry.id,
                    },
                    data: {
                      marketHigh:
                        account.accountType === "Investment" &&
                        marketHigh !== null
                          ? Math.round(marketHigh)
                          : null,
                      marketLow:
                        account.accountType === "Investment" &&
                        marketLow !== null
                          ? Math.round(marketLow)
                          : null,
                    },
                  })
                  resolve(null)
                })
              )

              return {
                ...entry,
                marketLow: marketLow !== null ? Math.round(marketLow) : null,
                marketHigh: marketHigh !== null ? Math.round(marketHigh) : null,
              }
            }),
          }
        }
      )

      await Promise.all(promises)

      return balanceHistoryWithMarketHighAndLow
    }
  })
}

export default withSession(handler)
