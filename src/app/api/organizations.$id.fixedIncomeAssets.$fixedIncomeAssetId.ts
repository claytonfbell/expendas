import { FixedIncomeAsset, FixedIncomeAssetType } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/api/organizations/$id/fixedIncomeAssets/$fixedIncomeAssetId"
)({
  server: {
    handlers: {  
    GET: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const fixedIncomeAssetId = Number(params.fixedIncomeAssetId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const fixedIncomeAsset = await prisma.fixedIncomeAsset.findUnique({
          where: {
            id: fixedIncomeAssetId,
          },
          include: {
            account: true,
          },
        })
        if (fixedIncomeAsset === null) {
          throw new Error("Fixed Income Asset not found")
        }
  
        return fixedIncomeAsset
      })
    },
    PUT: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const fixedIncomeAssetId = Number(params.fixedIncomeAssetId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const fixedIncomeAsset = await prisma.fixedIncomeAsset.findUnique({
          where: {
            id: fixedIncomeAssetId,
          },
          include: {
            account: true,
          },
        })
        if (fixedIncomeAsset === null) {
          throw new Error("Fixed Income Asset not found")
        }
  
        const requestBody: FixedIncomeAsset = await request.json()
  
        const { id, ...data } = requestBody
  
        const hasOriginalCostBasis: FixedIncomeAssetType[] = [
          "US_Treasury_T_Bill",
          "Bond_Fund",
        ]
        const hasApr: FixedIncomeAssetType[] = [
          "Bond_Fund",
          "CD",
          "Money_Market_Fund",
        ]
  
        await prisma.fixedIncomeAsset.update({
          data: {
            amount: data.amount,
            originalCostBasis: hasOriginalCostBasis.includes(
              fixedIncomeAsset.type
            )
              ? data.originalCostBasis
              : null,
            apr: hasApr.includes(fixedIncomeAsset.type) ? data.apr : null,
          },
          where: { id: fixedIncomeAssetId },
        })
  
        return await prisma.fixedIncomeAsset.findUnique({
          where: {
            id: fixedIncomeAssetId,
          },
          include: {
            account: true,
          },
        })
      })
    },
    DELETE: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const fixedIncomeAssetId = Number(params.fixedIncomeAssetId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        await prisma.fixedIncomeAsset.delete({
          where: { id: fixedIncomeAssetId },
        })
        return
      })
    },
  
    }
  }
})
