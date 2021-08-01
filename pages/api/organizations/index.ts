// pages/api/login.ts
import { NextApiResponse } from "next"
import { AddOrganizationRequest } from "../../../lib/api/AddOrganizationRequest"
import { requireAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { BadRequestException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../lib/server/session"
import validate from "../../../lib/server/validate"

// common includes safe to return to the front-end
export const organizationInclude = {
  users: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
}

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const user = await requireAuthentication(req, prisma)
    if (req.method === "GET") {
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

      return organizations
    } else if (req.method === "POST") {
      const { name }: AddOrganizationRequest = req.body
      validate({ name }).notEmpty()

      // check unique
      const exists = await prisma.organization.findFirst({
        where: { name: { equals: name } },
      })
      if (exists !== null) {
        throw new BadRequestException("Organization name is already used.")
      }

      // passed validation
      const organization = await prisma.organization.create({
        data: {
          name,
          users: {
            create: [{ userId: user.id, isAdmin: true }],
          },
        },
        include: organizationInclude,
      })

      return organization
    }
  })
}

export default withSession(handler)
