import { TickerPrice } from "@prisma/client"
import moment, { Moment } from "moment-timezone"
import prisma from "./prisma"

export async function populateMissingTickerPrices() {
  // try and find up to five missing dates in row that need to be fetched from the massive.com API and populated in the database
  // go back as far as 90 days in the past, but stop once we find 5 missing dates in a row (to avoid too many requests to the massive.com API)
  const fiveMissingDates: string[] = []

  // find the most recent 3 years saved ticker prices for VOO
  const mostRecentLimitThreeYears = await prisma.tickerPrice.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      ticker: "VOO",
      date: {
        gte: moment().subtract(3, "years").format("YYYY-MM-DD"),
      },
    },
    take: 365 * 3,
  })

  // fill the fiveMissingDates array with any missing dates in a row, starting from yesterday
  for (let i = 1; i < 365 * 3; i++) {
    // start from yesterday
    const dateToCheck = moment()
      .tz("America/Los_Angeles")
      .subtract(i, "days")
      .format("YYYY-MM-DD")
    const found = mostRecentLimitThreeYears.find(
      (tp) => tp.date === dateToCheck
    )

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

  // now use alphavantage.co api to get TODAY's price (after marke close) don't have to wait for massive.com to update with today's price
  if (isTooSoonForAlphaVantageRequest()) {
    console.log(
      "too soon for alphavantage.co request, skipping fetching today's price to avoid hitting rate limit"
    )
    return
  } else {
    console.log("fetching today's price from alphavantage.co")

    const alphavantageUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=VOO&apikey=${process.env.ALPHAVANTAGE_API_KEY}`
    const alphavantageResponse: AlphaVantageQuote = await fetch(
      alphavantageUrl
    ).then((res) => res.json())

    const today = moment().tz("America/Los_Angeles").format("YYYY-MM-DD")
    const currentPriceData = alphavantageResponse["Global Quote"]
      ? alphavantageResponse["Global Quote"]
      : undefined
    if (
      currentPriceData &&
      currentPriceData["07. latest trading day"] === today
    ) {
      console.log("todayPriceData", currentPriceData)
      await prisma.tickerPrice.upsert({
        where: {
          ticker_date: {
            ticker: "VOO",
            date: today,
          },
        },
        update: {
          price: Math.round(parseFloat(currentPriceData["05. price"]) * 100), // convert to cents
        },
        create: {
          ticker: "VOO",
          price: Math.round(parseFloat(currentPriceData["05. price"]) * 100), // convert to cents
          date: today,
        },
      })
    } else {
      console.log(
        `no price data found for today (${today}) from alphavantage.co response`
      )
    }
  }
}

const alphaVantageRequests: Moment[] = []

function isTooSoonForAlphaVantageRequest(): boolean {
  const maxCount = 1
  const timeWindowMinutes = 1

  const now = moment()
  const timeAgo = now.subtract(timeWindowMinutes, "minutes")

  // Remove timestamps that are older than 5 minutes
  while (
    alphaVantageRequests.length > 0 &&
    alphaVantageRequests[0].isBefore(timeAgo)
  ) {
    alphaVantageRequests.shift()
  }

  const tooSoon = alphaVantageRequests.length >= maxCount
  if (!tooSoon) {
    alphaVantageRequests.push(moment())
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

export async function autoUpdateInvestmentAccountBalances() {
  const latestTickerPrice = await getLatestTickerPrice()

  // get investment accounts
  const investmentAccounts = await prisma.account.findMany({
    where: {
      accountType: "Investment",
      tickerPriceId: {
        not: null,
      },
    },
    include: {
      tickerPrice: true,
    },
  })

  for (const account of investmentAccounts) {
    if (
      account.tickerPrice &&
      latestTickerPrice &&
      account.tickerPrice.date !== latestTickerPrice.date
    ) {
      // calculate number of shares based on old price
      const equityBalance = account.balance - (account.totalFixedIncome ?? 0)
      const numShares = equityBalance / account.tickerPrice.price
      // calculate new balance based on latest price
      const newBalance =
        numShares * latestTickerPrice.price + (account.totalFixedIncome ?? 0)

      await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: Math.round(newBalance),
          tickerPriceId: latestTickerPrice.id,
        },
      })
    } else {
      console.log(
        `skipping account ${account.id} because ticker price is already up to date`
      )
    }
  }
}

export async function getThreeYearLowTickerPrice() {
  const threeYearsAgo = moment().subtract(3, "years").format("YYYY-MM-DD")
  const threeYearLow = await prisma.tickerPrice.findFirst({
    where: {
      ticker: "VOO",
      date: {
        gte: threeYearsAgo,
      },
      price: {
        gt: 0,
      },
    },
    orderBy: {
      price: "asc",
    },
  })
  return threeYearLow
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

export interface AlphaVantageQuote {
  "Global Quote"?: GlobalQuote
}

export interface GlobalQuote {
  "01. symbol": string
  "02. open": string
  "03. high": string
  "04. low": string
  "05. price": string
  "06. volume": string
  "07. latest trading day": string
  "08. previous close": string
  "09. change": string
  "10. change percent": string
}
