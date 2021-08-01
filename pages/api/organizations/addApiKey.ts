// pages/api/login.ts
import { NextApiResponse } from "next"
import { v4 as uuidv4 } from "uuid"
import { AddApiKeyRequest } from "../../../lib/api/AddApiKeyRequest"
import { requireAdminAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { NotFoundException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../lib/server/session"
import { organizationInclude } from "./index"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "POST") {
      let { organizationId }: AddApiKeyRequest = req.body
      const user = await requireAdminAuthentication(req, prisma, organizationId)
      const organizations = await prisma.organization.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        include: organizationInclude,
      })
      const organization = await organizations.find(
        (x) => x.id === organizationId
      )
      if (organization === undefined) {
        throw new NotFoundException("Organization not found.")
      }

      // validation passed
      const apiKey = await prisma.apiKey.create({
        data: {
          organizationId: organization.id,
          apiKey: uuidv4(),
        },
      })
      return await prisma.organization.update({
        where: { id: organization.id },
        data: {
          apiKeys: {
            connect: {
              id: apiKey.id,
            },
          },
        },
        include: organizationInclude,
      })
    }
  })
}

export default withSession(handler)
