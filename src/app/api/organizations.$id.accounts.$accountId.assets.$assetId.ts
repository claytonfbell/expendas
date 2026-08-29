import { Asset } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { getLatestTickerPrice } from "../../components/server/tickerPrices"
import { recalculateAccountBalance } from "../../components/server/recalculateAccountBalance"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/api/organizations/$id/accounts/$accountId/assets/$assetId"
)({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const accountId = Number(params.accountId)
          const assetId = Number(params.assetId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const asset = await prisma.asset.findUnique({
            where: { id: assetId },
            include: { assetTicker: true },
          })
          if (asset === null) {
            throw new Error("Asset not found")
          }

          const { assetTickerId, currentBalance } = await request.json()

          const assetTicker = await prisma.assetTicker.findUnique({
            where: { id: assetTickerId },
          })
          if (!assetTicker) {
            throw new Error(`Asset ticker not found for id ${assetTickerId}`)
          }

          const latestPrice = await getLatestTickerPrice(assetTicker.ticker)

          const updated = await prisma.asset.update({
            where: { id: assetId },
            data: {
              assetTickerId,
              tickerPrice: latestPrice ? latestPrice.price : asset.tickerPrice,
              balance: currentBalance,
            },
            include: { assetTicker: true },
          })

          await recalculateAccountBalance(accountId)

          return updated
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const accountId = Number(params.accountId)
          const assetId = Number(params.assetId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          await prisma.asset.delete({
            where: { id: assetId },
          })

          await recalculateAccountBalance(accountId)

          return
        })
      },
    },
  },
})
