import { FixedIncomeAsset } from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    await requireOrganizationAuthentication(req, prisma, organizationId)
    // GET
    if (req.method === "GET") {
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
    }
    // POST
    else if (req.method === "POST") {
      const requestBody: NewFixedIncomeAssetRequestBody = req.body

      if (requestBody.accountId === null) {
        throw new Error("Account is required")
      }
      // check account belongs to organization
      const account = await prisma.account.findUnique({
        where: { id: requestBody.accountId, organizationId },
      })
      if (!account) {
        throw new Error("Account not found")
      }

      // passed checks, create new plan with copied settings and contributions
      const fixedIncomeAsset = await prisma.fixedIncomeAsset.create({
        data: {
          ...requestBody,
          accountId: requestBody.accountId!,
        },
      })
      return fixedIncomeAsset
    }
  })
}

export default withSession(handler)

export type NewFixedIncomeAssetRequestBody = Omit<
  FixedIncomeAsset,
  "id" | "accountId"
> & {
  accountId: number | null
}
