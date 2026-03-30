import { TickerPrice } from "@prisma/client"
import moment, { Moment } from "moment-timezone"
import prisma from "./prisma"
import { scrapeCurrentVOOPrice } from "./scrapeVoo"

export async function populateMissingTickerPrices() {
  // try and find up to five missing dates in row that need to be fetched from the massive.com API and populated in the database
  // go back as far as 90 days in the past, but stop once we find 5 missing dates in a row (to avoid too many requests to the massive.com API)
  const fiveMissingDates: string[] = []

  // find the most recent 2 years saved ticker prices for VOO
  const mostRecentLimitTwoYears = await prisma.tickerPrice.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      ticker: "VOO",
      date: {
        gte: moment().subtract(2, "years").format("YYYY-MM-DD"),
      },
    },
    take: 90,
  })

  // fill the fiveMissingDates array with any missing dates in a row, starting from yesterday
  for (let i = 1; i < 90; i++) {
    // start from yesterday
    const dateToCheckMoment = moment()
      .tz("America/Los_Angeles")
      .subtract(i, "days")

    // skip date if its Saturday or Sunday since market is closed and we won't get a price for those days
    const dayOfWeek = dateToCheckMoment.day()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    const dateToCheck = dateToCheckMoment.format("YYYY-MM-DD")

    const found = mostRecentLimitTwoYears.find((tp) => tp.date === dateToCheck)

    if (!found) {
      fiveMissingDates.push(dateToCheck)
    }
    if (fiveMissingDates.length >= 5) {
      break
    }
  }

  console.log("fiveMissingDates", fiveMissingDates)

  let keepGoing = true
  while (keepGoing && fiveMissingDates.length > 0) {
    if (isTooSoonForMassiveRequest()) {
      keepGoing = false
      console.log(
        "too soon for massive.com request, stopping to avoid hitting rate limit"
      )
      continue
    }

    // curl -X GET "https://api.massive.com/v1/open-close/VOO/2026-03-27?adjusted=true&apiKey=XbyXpvEG3KGRxYfvLutlhlBNKuolCEee"
    const dateToFetch = fiveMissingDates.shift()!
    console.log("fetching price for date", dateToFetch)

    const massiveUrl = `https://api.massive.com/v1/open-close/VOO/${dateToFetch}?adjusted=true&apiKey=${process.env.MASSIVE_API_KEY}`
    const massiveResponse: MassiveApiResponse = await (
      await fetch(massiveUrl)
    ).json()

    console.log("massiveResponse", massiveResponse)

    if (
      massiveResponse.status === "OK" ||
      massiveResponse.status === "NOT_FOUND"
    ) {
      // insert or update the price in the database
      await prisma.tickerPrice.upsert({
        where: {
          ticker_date: {
            ticker: "VOO",
            date: dateToFetch,
          },
        },
        update: {
          price: (massiveResponse.close ?? 0) * 100, // convert to cents, 0 if market was closed that day and no price is available
        },
        create: {
          ticker: "VOO",
          price: (massiveResponse.close ?? 0) * 100, // convert to cents, 0 if market was closed that day and no price is available
          date: dateToFetch,
        },
      })
    }
  }

  // now scrape today's current VOO price from yahoo finance
  if (isTooSoonForScrapeRequest()) {
    console.log(
      "too soon for scrape request, skipping scraping today's price to avoid hitting rate limit"
    )
    return
  } else {
    console.log("scraping today's price from yahoo finance")
    const scrapedPrice = await scrapeCurrentVOOPrice()
    if (scrapedPrice !== null) {
      console.log("scrapedPrice", scrapedPrice)
      const today = moment().tz("America/Los_Angeles").format("YYYY-MM-DD")
      await prisma.tickerPrice.upsert({
        where: {
          ticker_date: {
            ticker: "VOO",
            date: today,
          },
        },
        update: {
          price: scrapedPrice,
        },
        create: {
          ticker: "VOO",
          price: scrapedPrice,
          date: today,
        },
      })
    } else {
      console.log("failed to scrape today's price from yahoo finance")
    }
  }
}

const scrapeRequests: Moment[] = []

function isTooSoonForScrapeRequest(): boolean {
  const maxCount = 1
  const timeWindowMinutes = 1

  const now = moment()
  const timeAgo = now.subtract(timeWindowMinutes, "minutes")

  // Remove timestamps that are older than 5 minutes
  while (scrapeRequests.length > 0 && scrapeRequests[0].isBefore(timeAgo)) {
    scrapeRequests.shift()
  }

  const tooSoon = scrapeRequests.length >= maxCount
  if (!tooSoon) {
    scrapeRequests.push(moment())
  }
  return tooSoon
}

const massiveRequests: Moment[] = []

function isTooSoonForMassiveRequest(): boolean {
  const maxCount = 5
  const timeWindowMinutes = 1

  const now = moment()
  const timeAgo = now.subtract(timeWindowMinutes, "minutes")

  // Remove timestamps that are older than 5 minutes
  while (massiveRequests.length > 0 && massiveRequests[0].isBefore(timeAgo)) {
    massiveRequests.shift()
  }

  const tooSoon = massiveRequests.length >= maxCount
  if (!tooSoon) {
    massiveRequests.push(moment())
  }
  return tooSoon
}

type MassiveApiResponse = {
  status: "OK" | "NOT_FOUND" | "ERROR"
  message?: string
  from?: string
  symbol?: string
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
  afterHours?: number
  preMarket?: number
}

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
