import { AddOrganizationRequest } from "../../../lib/api/AddOrganizationRequest"
import { requireAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { BadRequestException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const organizationInclude = {
  users: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          dateOfBirth: true,
          socialSecurityEstimates: true,
        },
      },
    },
  },
}

export const Route = createFileRoute("/api/organizations")({
  server: {
    handlers: {
  GET: async ({ request }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
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
    })
  },
  POST: async ({ request }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
      const { name }: AddOrganizationRequest = await request.json()
      validate({ name }).notEmpty()

      const exists = await prisma.organization.findFirst({
        where: { name: { equals: name } },
      })
      if (exists !== null) {
        throw new BadRequestException("Organization name is already used.")
      }

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
    })
  },

    }
  }
})
