import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import dayjs from "../../components/dayjs"
import { generateDigestHtml } from "../../components/server/digestHtml"

export const Route = createFileRoute("/api/email-digest-preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)

          const membership = await prisma.usersOnOrganizations.findFirst({
            where: { userId: user.id },
            orderBy: { organizationId: "asc" },
          })
          if (membership === null) {
            return new Response("No organization found", { status: 404 })
          }

          const html = await generateDigestHtml(user.id, membership.organizationId)

          return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
        })
      },
    },
  },
})