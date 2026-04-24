import { TickerPrice } from "@prisma/client"
import moment from "moment-timezone"
import {
  populateMissingTickerPrices,
  Ticker,
} from "./populateMissingTickerPrices"
import prisma from "./prisma"

export async function getLatestTickerPrice(ticker: Ticker) {
  await populateMissingTickerPrices("VOO")
  await populateMissingTickerPrices("FBND")
  let latestTickerPrice: TickerPrice | null = null
  latestTickerPrice = await prisma.tickerPrice.findFirst({
    where: {
      ticker: ticker,
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

export async function getTwoYearLowTickerPrice(ticker: Ticker) {
  const twoYearsAgo = moment().subtract(2, "years").format("YYYY-MM-DD")
  const twoYearLow = await prisma.tickerPrice.findFirst({
    where: {
      ticker: ticker,
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

export async function getAllTimeHighTickerPrice(ticker: Ticker) {
  const allTimeHigh = await prisma.tickerPrice.findFirst({
    where: {
      ticker: ticker,
    },
    orderBy: {
      price: "desc",
    },
  })
  return allTimeHigh
}
