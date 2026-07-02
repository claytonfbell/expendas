import { RemoveUserRequestData } from "../../components/api/types/RemoveUserRequestData"
import { requireAdminAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { NotFoundException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import { organizationInclude } from "./organizations"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/removeUser")({
  server: {
    handlers: {
  POST: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      let { organizationId, userId }: RemoveUserRequestData = await request.json()
      const user = await requireAdminAuthentication(session, prisma, organizationId)
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
    })
  },

    }
  }
})
