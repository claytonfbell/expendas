// pages/api/login.ts
import { NextApiResponse } from "next"
import { OrganizationWithIncludes } from "../../../lib/api/api"
import {
  requireAdminAuthentication,
  requireAuthentication,
} from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../lib/server/session"
import validate from "../../../lib/server/validate"
import { organizationInclude } from "./index"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (
      req.method === "GET" ||
      req.method === "PUT" ||
      req.method === "DELETE"
    ) {
      const user = await requireAuthentication(req, prisma)
      const organization = await prisma.organization.findUnique({
        where: {
          id: Number(req.query.id),
        },
        include: organizationInclude,
      })
      if (organization === null) {
        throw new NotFoundException("Organization not found.")
      } else if (
        organization.users.filter((x) => x.userId === user.id).length === 0
      ) {
        throw new ForbiddenException()
      }

      // GET
      if (req.method === "GET") {
        //   return organization
        return organization
      }
      // PUT
      else if (req.method === "PUT") {
        await requireAdminAuthentication(req, prisma, organization.id)
        const { name, users }: OrganizationWithIncludes = req.body
        validate({ name }).notEmpty()

        // name must be unique
        const exists = await prisma.organization.findMany({
          where: {
            id: { not: organization.id },
            name: { equals: name },
          },
        })
        if (exists.length > 0) {
          throw new BadRequestException("Name is already used.")
        }

        // passed validation
        // update isAdmin for each user submitted
        for (let i = 0; i < users.length; i++) {
          const updateUser = users[i]
          await prisma.usersOnOrganizations.update({
            data: {
              isAdmin: updateUser.isAdmin,
            },
            where: {
              userId_organizationId: {
                userId: updateUser.userId,
                organizationId: organization.id,
              },
            },
          })
        }

        return await prisma.organization.update({
          where: { id: organization.id },
          data: {
            name,
          },
          include: organizationInclude,
        })
      }
      // DELETE
      else if (req.method === "DELETE") {
        await requireAdminAuthentication(req, prisma, organization.id)
        // delete the payments
        await prisma.payment.deleteMany({
          where: { account: { organizationId: { equals: organization.id } } },
        })
        // delete the joins
        await prisma.organization.update({
          data: {
            users: { deleteMany: {} },
            accounts: { deleteMany: {} },
          },
          where: { id: organization.id },
        })
        // finally delete the org
        await prisma.organization.delete({ where: { id: organization.id } })
      }
    }
  })
}

export default withSession(handler)
