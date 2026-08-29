import { AssetTicker } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication, requireEmailAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

const ALLOWED_EMAIL = "claytonfbell@gmail.com"

export const Route = createFileRoute("/api/asset-tickers/$assetTickerId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          await requireAuthentication(session, prisma)
          const assetTickerId = Number(params.assetTickerId)
          const assetTicker = await prisma.assetTicker.findUnique({
            where: { id: assetTickerId },
          })
          if (!assetTicker) {
            throw new BadRequestException("Asset ticker not found.")
          }
          return assetTicker
        })
      },
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          await requireEmailAuthentication(session, prisma, ALLOWED_EMAIL)
          const assetTickerId = Number(params.assetTickerId)
          const body: AssetTicker = await request.json()

          validate({ ticker: body.ticker }).notEmpty()
          validate({ assetType: body.assetType }).notEmpty()
          validate({ tickerDisplayName: body.tickerDisplayName }).notEmpty()

          await prisma.assetTicker.update({
            data: {
              ticker: body.ticker,
              assetType: body.assetType,
              dividendApr: body.dividendApr,
              tickerDisplayName: body.tickerDisplayName,
              lookup: body.lookup,
            },
            where: { id: assetTickerId },
          })
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          await requireEmailAuthentication(session, prisma, ALLOWED_EMAIL)
          const assetTickerId = Number(params.assetTickerId)
          await prisma.assetTicker.delete({
            where: { id: assetTickerId },
          })
        })
      },
    },
  },
})
