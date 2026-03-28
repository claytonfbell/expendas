import { TickerPrice } from "@prisma/client"
import moment, { Moment } from "moment-timezone"
import prisma from "./prisma"

export async function populateMissingTickerPrices() {
  // try and find up to five missing dates in row that need to be fetched from the massive.com API and populated in the database
  // go back as far as 90 days in the past, but stop once we find 5 missing dates in a row (to avoid too many requests to the massive.com API)
  const fiveMissingDates: string[] = []

  // find the most recent 90 saved ticker prices for VOO
  const mostRecentLimit90 = await prisma.tickerPrice.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      ticker: "VOO",
      date: {
        gte: moment().subtract(90, "days").format("YYYY-MM-DD"),
      },
    },
    take: 90,
  })

  // fill the fiveMissingDates array with any missing dates in a row, starting from yesterday and going back up to 90 days, but stop once we find a date that is already in the database (to avoid too many requests to the massive.com API)
  for (let i = 0; i < 90; i++) {
    const dateToCheck = moment().subtract(i, "days").format("YYYY-MM-DD")
    const found = mostRecentLimit90.find((tp) => tp.date === dateToCheck)

    // is before market closing (today at 1pm Pacific time)
    const marketCloseTime = moment().tz("America/Los_Angeles").set({
      hour: 13,
      minute: 0,
      second: 0,
      millisecond: 0,
    })
    const now = moment()
    if (i === 0 && now.isBefore(marketCloseTime)) {
      // if it's before market closing time, skip checking for today's date and move on to yesterday
      console.log("skipping today's date since it's before market close time")
      continue
    }
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
