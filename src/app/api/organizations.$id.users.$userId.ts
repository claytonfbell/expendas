import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/users/$userId"
)({
  server: {
    handlers: {  
    PUT: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const userId = Number(params.userId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
            organizations: {
              some: {
                organizationId,
              },
            },
          },
        })
  
        validate({ user }).notNull()
  
        const body = await request.json()
        const { firstName, lastName, dateOfBirth, socialSecurityEstimates } =
          body
  
        validate({ firstName }).notNull().min(1)
        validate({ lastName }).notNull().min(1)
        validate({ dateOfBirth }).notNull()
  
        return await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            firstName,
            lastName,
            dateOfBirth,
            socialSecurityEstimates,
          },
        })
      })
    },
  
    }
  }
})
