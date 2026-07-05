import { TickerPrice } from "@prisma/client"
import dayjs from "../dayjs"
import {
  populateMissingTickerPrices,
  Ticker,
} from "./populateMissingTickerPrices"
import prisma from "./prisma"

const CASH_PRICE = 100

function cashTickerPrice(): TickerPrice {
  return {
    id: 0,
    ticker: "CASH",
    price: CASH_PRICE,
    date: dayjs().tz("America/Los_Angeles").format("YYYY-MM-DD"),
    closed: true,
  }
}

export async function getLatestTickerPrice(ticker: Ticker) {
  if (ticker === "CASH") return cashTickerPrice()
  await populateMissingTickerPrices(ticker)
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
  if (ticker === "CASH") return cashTickerPrice()
  const twoYearsAgo = dayjs().subtract(2, "years").format("YYYY-MM-DD")
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
  if (ticker === "CASH") return cashTickerPrice()
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