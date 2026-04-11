import { FixedIncomeAsset, FixedIncomeAssetType } from "@prisma/client"
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
    const fixedIncomeAssetId = Number(req.query.fixedIncomeAssetId)
    await requireOrganizationAuthentication(req, prisma, organizationId)
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

    // GET
    if (req.method === "GET") {
      return fixedIncomeAsset
    }
    // PUT
    else if (req.method === "PUT") {
      // first validate input
      const requestBody: FixedIncomeAsset = req.body

      //   validate({ name }).notEmpty()

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

      // passed validation - update
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

      // refetch with includes
      return await prisma.fixedIncomeAsset.findUnique({
        where: {
          id: fixedIncomeAssetId,
        },
        include: {
          account: true,
        },
      })
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.fixedIncomeAsset.delete({
        where: { id: fixedIncomeAssetId },
      })
    }
  })
}

export default withSession(handler)
