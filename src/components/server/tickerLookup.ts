import prisma from "./prisma"
import { Ticker } from "./tickerTypes"

export async function isLookupTicker(ticker: Ticker): Promise<boolean> {
  const assetTicker = await prisma.assetTicker.findUnique({
    where: { ticker },
  })
  return assetTicker?.lookup ?? true
}
