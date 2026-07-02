import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { getPaycheckDates } from "../../../lib/server/getPaycheckDates"
import prisma from "../../../lib/server/prisma"

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

    }
  }
})
