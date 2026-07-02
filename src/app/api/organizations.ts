import { AddOrganizationRequestData } from "../../components/api/types/AddOrganizationRequestData"
import { requireAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { BadRequestException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
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
      const { name }: AddOrganizationRequestData = await request.json()
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
