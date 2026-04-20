import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { BadRequestException } from "../../../../../../lib/server/HttpException"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import { getCloudFileStream } from "../../../../../../lib/server/cloudFile"
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
      const stream = await getCloudFileStream(
        receipt.organizationCloudFile.cloudFile
      )

      // headers
      res.setHeader(
        "Content-Type",
        receipt.organizationCloudFile.cloudFile.contentType
      )
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${receipt.organizationCloudFile.name}"`
      )

      // pipe stream to response
      stream.pipe(res)
      return false
    }
  })
}

export default withSession(handler)
