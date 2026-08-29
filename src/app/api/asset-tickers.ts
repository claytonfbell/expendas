import { AssetTicker } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication, requireEmailAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

const ALLOWED_EMAIL = "claytonfbell@gmail.com"

export const Route = createFileRoute("/api/asset-tickers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (session) => {
          await requireAuthentication(session, prisma)
          const assetTickers = await prisma.assetTicker.findMany({
            orderBy: { ticker: "asc" },
          })
          return assetTickers
        })
      },
      POST: async ({ request }) => {
        return buildResponse(request, async (session) => {
          await requireEmailAuthentication(session, prisma, ALLOWED_EMAIL)
          const body: AssetTickerCreateRequest = await request.json()

          validate({ ticker: body.ticker }).notEmpty()
          validate({ assetType: body.assetType }).notEmpty()
          validate({ tickerDisplayName: body.tickerDisplayName }).notEmpty()

          const assetTicker = await prisma.assetTicker.create({
            data: {
              ticker: body.ticker,
              assetType: body.assetType,
              dividendApr: body.dividendApr,
              tickerDisplayName: body.tickerDisplayName,
              lookup: body.lookup,
            },
          })
          return assetTicker
        })
      },
    },
  },
})

export type AssetTickerCreateRequest = Omit<
  AssetTicker,
  "id"
>
