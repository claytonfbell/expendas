import { buildResponse } from "../../components/server/buildResponse"
import {
  getAllTimeHighTickerPrice,
  getLatestTickerPrice,
  getTwoYearLowTickerPrice,
} from "../../components/server/tickerPrices"
import prisma from "../../components/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

export type TickerPriceData = {
  currentPrice: number
  previousPrice: number
  allTimeHigh: number
  twoYearLow: number
}

export type TickerPriceResponse = Record<string, TickerPriceData>

export const Route = createFileRoute("/api/tickerPrices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async () => {
          const url = new URL(request.url)
          const tickersParam = url.searchParams.get("tickers")
          const tickers = tickersParam
            ? tickersParam.split(",")
            : (
                await prisma.tickerPrice.findMany({
                  select: { ticker: true },
                  distinct: ["ticker"],
                })
              ).map((t) => t.ticker)

          const response: TickerPriceResponse = {}

          for (const ticker of tickers) {
            const currentPrice = await getLatestTickerPrice(ticker).then(
              (price) => price?.price ?? 0
            )
            const previousPrice = await prisma.tickerPrice.findFirst({
              where: { ticker, price: { gt: 0 } },
              orderBy: { date: "desc" },
              skip: 1,
            }).then((price) => price?.price ?? currentPrice)
            const allTimeHigh = await getAllTimeHighTickerPrice(ticker).then(
              (price) => price?.price ?? 0
            )
            const twoYearLow = await getTwoYearLowTickerPrice(ticker).then(
              (price) => price?.price ?? 0
            )

            response[ticker] = { currentPrice, previousPrice, allTimeHigh, twoYearLow }
          }

          return response
        })
      },
    },
  },
})