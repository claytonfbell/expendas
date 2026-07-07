import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/tasks/groups/reorder"
)({
  server: {
    handlers: {
      async POST({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const requestBody: { items: { id: number; sortOrder: number }[] } =
            await request.json()

          await prisma.$transaction(
            requestBody.items.map((item) =>
              prisma.taskGroup.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
              })
            )
          )

          return { success: true }
        })
      },
    },
  },
})