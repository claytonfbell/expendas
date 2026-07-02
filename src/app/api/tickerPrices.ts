import { buildResponse } from "../../../lib/server/buildResponse"
import {
  getAllTimeHighTickerPrice,
  getLatestTickerPrice,
  getTwoYearLowTickerPrice,
} from "../../../lib/server/tickerPrices"
import { createFileRoute } from "@tanstack/react-router"

export type TickerPriceResponse = {
  currentPrice: number
  allTimeHigh: number
  twoYearLow: number
}

export const Route = createFileRoute("/api/tickerPrices")({
  server: {
    handlers: {
  GET: async ({ request }) => {
    return buildResponse(request, async () => {
      const currentPrice = await getLatestTickerPrice("VOO").then(
        (price) => price?.price ?? 0
      )
      const allTimeHigh = await getAllTimeHighTickerPrice("VOO").then(
        (price) => price?.price ?? 0
      )
      const twoYearLow = await getTwoYearLowTickerPrice("VOO").then(
        (price) => price?.price ?? 0
      )

      const response: TickerPriceResponse = {
        currentPrice,
        allTimeHigh,
        twoYearLow,
      }
      return response
    })
  },

    }
  }
})
