// pages/api/login.ts
import { NextApiResponse } from "next"
import { buildResponse } from "../../lib/server/buildResponse"
import withSession, { NextIronRequest } from "../../lib/server/session"
import {
  getAllTimeHighTickerPrice,
  getLatestTickerPrice,
  getThreeYearLowTickerPrice,
} from "../../lib/server/tickerPrices"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    buildResponse(res, async () => {
      const currentPrice = await getLatestTickerPrice().then(
        (price) => price?.price ?? 0
      )
      const allTimeHigh = await getAllTimeHighTickerPrice().then(
        (price) => price?.price ?? 0
      )
      const threeYearLow = await getThreeYearLowTickerPrice().then(
        (price) => price?.price ?? 0
      )

      const response: TickerPriceResponse = {
        currentPrice,
        allTimeHigh,
        threeYearLow,
      }
      return response
    })
  }
}

export default withSession(handler)

export type TickerPriceResponse = {
  currentPrice: number
  allTimeHigh: number
  threeYearLow: number
}
