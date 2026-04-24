// pages/api/login.ts
import { NextApiResponse } from "next"
import { buildResponse } from "../../lib/server/buildResponse"
import withSession, { NextIronRequest } from "../../lib/server/session"
import {
  getAllTimeHighTickerPrice,
  getLatestTickerPrice,
  getTwoYearLowTickerPrice,
} from "../../lib/server/tickerPrices"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    buildResponse(res, async () => {
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
  }
}

export default withSession(handler)

export type TickerPriceResponse = {
  currentPrice: number
  allTimeHigh: number
  twoYearLow: number
}
