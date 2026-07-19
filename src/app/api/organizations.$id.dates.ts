import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { getPaycheckDates } from "../../components/server/getPaycheckDates"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/dates")({
  server: {
    handlers: {
      async GET({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          return await getPaycheckDates(organizationId)
        })
      },
    },
  },
})
