import { TickerPrice } from "@prisma/client"
import moment from "moment-timezone"
import { populateMissingTickerPrices } from "./populateMissingTickerPrices"
import prisma from "./prisma"

export async function getLatestTickerPrice() {
  await populateMissingTickerPrices()
  let latestTickerPrice: TickerPrice | null = null
  latestTickerPrice = await prisma.tickerPrice.findFirst({
    where: {
      ticker: "VOO",
      price: {
        gt: 0,
      },
    },
    orderBy: {
      date: "desc",
    },
  })
  return latestTickerPrice
}

export async function getTwoYearLowTickerPrice() {
  const twoYearsAgo = moment().subtract(2, "years").format("YYYY-MM-DD")
  const twoYearLow = await prisma.tickerPrice.findFirst({
    where: {
      ticker: "VOO",
      date: {
        gte: twoYearsAgo,
      },
      price: {
        gt: 0,
      },
    },
    orderBy: {
      price: "asc",
    },
  })
  return twoYearLow
}

export async function getAllTimeHighTickerPrice() {
  const allTimeHigh = await prisma.tickerPrice.findFirst({
    where: {
      ticker: "VOO",
    },
    orderBy: {
      price: "desc",
    },
  })
  return allTimeHigh
}
