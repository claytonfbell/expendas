import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { populateMissingTickerPrices } from "../../components/server/populateMissingTickerPrices"
import prisma from "../../components/server/prisma"
import { recalculateAccountBalance } from "../../components/server/recalculateAccountBalance"
import { getLatestTickerPrice } from "../../components/server/tickerPrices"

export const Route = createFileRoute(
  "/api/organizations/$id/accounts/$accountId/assets"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const accountId = Number(params.accountId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const assets = await prisma.asset.findMany({
            where: { accountId },
            orderBy: { id: "asc" },
          })
          return assets
        })
      },
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const accountId = Number(params.accountId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const { ticker, assetType, currentBalance } = await request.json()

          await populateMissingTickerPrices(ticker)

          const latestPrice = await getLatestTickerPrice(ticker)
          if (!latestPrice) {
            throw new Error(`No price found for ticker ${ticker}`)
          }

          const asset = await prisma.asset.create({
            data: {
              accountId,
              ticker,
              tickerPrice: latestPrice.price,
              balance: currentBalance,
              assetType,
            },
          })

          await recalculateAccountBalance(accountId)

          return asset
        })
      },
    },
  },
})
