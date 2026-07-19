import sgMail from "@sendgrid/mail"
import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { generateDigestHtml } from "../../components/server/digestHtml"

export const Route = createFileRoute("/api/email-digest/send")({
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

          const html = await generateDigestHtml(
            user.id,
            membership.organizationId
          )

          sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")
          await sgMail.send({
            to:
              process.env.NODE_ENV !== "production"
                ? process.env.DEV_OVERRIDE_EMAIL || "claytonfbell@gmail.com"
                : user.email,
            from: "noreply@expendas.com",
            subject: `${user.firstName}'s Expendas Daily`,
            text: "Your daily digest is available.",
            html,
          })

          return { sent: true, to: user.email }
        })
      },
    },
  },
})
