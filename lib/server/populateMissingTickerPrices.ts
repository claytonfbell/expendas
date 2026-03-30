import moment from "moment-timezone"
import prisma from "./prisma"
import { RateLimit } from "./RateLimit"
import { scrapeCurrentVOOPrice } from "./scrapeCurrentVOOPrice"

export async function populateMissingTickerPrices() {
  // try and find up to five missing dates in row that need to be fetched from the massive.com API and populated in the database
  // go back as far as 90 days in the past, but stop once we find 5 missing dates in a row (to avoid too many requests to the massive.com API)
  const fiveMissingDates: string[] = []

  // find the most recent saved ticker prices for VOO
  const mostRecent = await prisma.tickerPrice.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      ticker: "VOO",
      date: {
        gte: moment().subtract(90, "days").format("YYYY-MM-DD"),
      },
      closed: true, // only consider closed prices, we want to replace any non-closed prices with massive.com prices
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

    const found = mostRecent.find((tp) => tp.date === dateToCheck)

    if (!found) {
      fiveMissingDates.push(dateToCheck)
    }
    if (fiveMissingDates.length >= 5) {
      break
    }
  }

  console.log("fiveMissingDates", fiveMissingDates)

  const massiveRateLimit = new RateLimit("massiveApi", [
    {
      max: 5,
      durationMs: 60 * 60 * 1000, // 1 hour
    },
  ])
  let keepGoing = true
  while (keepGoing && fiveMissingDates.length > 0) {
    if (massiveRateLimit.isRateLimited()) {
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
          closed: true,
        },
        create: {
          ticker: "VOO",
          price: (massiveResponse.close ?? 0) * 100, // convert to cents, 0 if market was closed that day and no price is available
          date: dateToFetch,
          closed: true,
        },
      })
    }
  }

  // now scrape today's current VOO price from yahoo finance
  const scrapeRateLimit = new RateLimit("scrapeCurrentVOOPrice", [
    {
      max: 1,
      durationMs: 5 * 60 * 1000, // 5 minutes
    },
  ])

  const today = moment().tz("America/Los_Angeles").format("YYYY-MM-DD")
  // check if saturday or sunday, if so skip since market is closed and we won't get a price for today
  const dayOfWeek = moment().tz("America/Los_Angeles").day()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("markets closed weekends, skipping scrape for today's price")
    return
  } else if (scrapeRateLimit.isRateLimited()) {
    console.log("too soon for scrape request")
    return
  } else {
    console.log("scraping today's price from the web")
    const scrapedPrice = await scrapeCurrentVOOPrice()
    if (scrapedPrice !== null) {
      console.log("scrapedPrice", scrapedPrice)

      await prisma.tickerPrice.upsert({
        where: {
          ticker_date: {
            ticker: "VOO",
            date: today,
          },
        },
        update: {
          price: scrapedPrice,
          closed: false,
        },
        create: {
          ticker: "VOO",
          price: scrapedPrice,
          date: today,
          closed: false,
        },
      })
    } else {
      console.log("failed to scrape today's price from the web")
    }
  }
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
