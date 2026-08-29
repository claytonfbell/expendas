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
            include: { assetTicker: true },
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

          const { assetTickerId, currentBalance } = await request.json()

          const assetTicker = await prisma.assetTicker.findUnique({
            where: { id: assetTickerId },
          })
          if (!assetTicker) {
            throw new Error(`Asset ticker not found for id ${assetTickerId}`)
          }

          await populateMissingTickerPrices(assetTicker.ticker)

          const latestPrice = await getLatestTickerPrice(assetTicker.ticker)
          if (!latestPrice) {
            throw new Error(`No price found for ticker ${assetTicker.ticker}`)
          }

          const asset = await prisma.asset.create({
            data: {
              accountId,
              assetTickerId,
              tickerPrice: latestPrice.price,
              balance: currentBalance,
            },
            include: { assetTicker: true },
          })

          await recalculateAccountBalance(accountId)

          return asset
        })
      },
    },
  },
})
