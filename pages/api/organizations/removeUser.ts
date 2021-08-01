// pages/api/login.ts
import { NextApiResponse } from "next"
import { RemoveUserRequest } from "../../../lib/api/RemoveUserRequest"
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
      let { organizationId, userId }: RemoveUserRequest = req.body
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
      await prisma.usersOnOrganizations.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId: organization.id,
          },
        },
      })
      return await prisma.organization.findUnique({
        where: { id: organization.id },
        include: organizationInclude,
      })
    }
  })
}

export default withSession(handler)
