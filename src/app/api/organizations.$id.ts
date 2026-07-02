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
import validate from "../../../lib/server/validate"
import { organizationInclude } from "./organizations"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id")({
  server: {
    handlers: {
  GET: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
      const organization = await prisma.organization.findUnique({
        where: {
          id: Number(params.id),
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

      //   return organization
      return organization
    })
  },
  PUT: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
      const organization = await prisma.organization.findUnique({
        where: {
          id: Number(params.id),
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

      await requireAdminAuthentication(session, prisma, organization.id)
      const {
        name,
        users,
        targetEquityPercentage,
      }: OrganizationWithIncludes = await request.json()
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
          targetEquityPercentage: Math.round(targetEquityPercentage),
        },
        include: organizationInclude,
      })
    })
  },
  DELETE: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
      const organization = await prisma.organization.findUnique({
        where: {
          id: Number(params.id),
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

      await requireAdminAuthentication(session, prisma, organization.id)
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
    })
  },

    }
  }
})
