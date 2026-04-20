import { Receipt } from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { BadRequestException } from "../../../../../../lib/server/HttpException"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import prisma from "../../../../../../lib/server/prisma"
import withSession, {
  NextIronRequest,
} from "../../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const receiptId = Number(req.query.receiptId)
    await requireOrganizationAuthentication(req, prisma, organizationId)
    const receipt = await prisma.receipt.findUnique({
      where: {
        id: receiptId,
        organizationCloudFile: {
          organizationId,
        },
      },
      include: {
        account: true,
        organizationCloudFile: {
          include: {
            cloudFile: true,
          },
        },
      },
    })

    if (!receipt) {
      throw new BadRequestException("Receipt not found.")
    }

    // GET
    if (req.method === "GET") {
      return receipt
    }
    // PUT
    else if (req.method === "PUT") {
      // first validate input
      const requestBody: Receipt = req.body

      // passed validation - update
      await prisma.receipt.update({
        data: {
          amount: requestBody.amount,
          date: requestBody.date,
          datePaid: requestBody.datePaid,
          accountId: requestBody.accountId,
          merchant: requestBody.merchant,
          receiptType: requestBody.receiptType,
        },
        where: { id: receiptId },
        include: {
          account: true,
          organizationCloudFile: {
            include: {
              cloudFile: true,
            },
          },
        },
      })
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.receipt.delete({
        where: { id: receiptId },
      })
    }
  })
}

export default withSession(handler)
