import { FixedIncomeAsset } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/fixedIncomeAssets"
)({
  server: {
    handlers: {  
    GET: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const fixedIncomeAssets = await prisma.fixedIncomeAsset.findMany({
          where: {
            account: {
              organizationId,
            },
          },
          orderBy: {
            id: "asc",
          },
          include: {
            account: true,
          },
        })
        return fixedIncomeAssets
      })
    },
    POST: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const requestBody: NewFixedIncomeAssetRequestBody = await request.json()
  
        if (requestBody.accountId === null) {
          throw new Error("Account is required")
        }
        const account = await prisma.account.findUnique({
          where: { id: requestBody.accountId, organizationId },
        })
        if (!account) {
          throw new Error("Account not found")
        }
  
        const fixedIncomeAsset = await prisma.fixedIncomeAsset.create({
          data: {
            ...requestBody,
            accountId: requestBody.accountId!,
          },
        })
        return fixedIncomeAsset
      })
    },
  
    }
  }
})

export type NewFixedIncomeAssetRequestBody = Omit<
  FixedIncomeAsset,
  "id" | "accountId"
> & {
  accountId: number | null
}
