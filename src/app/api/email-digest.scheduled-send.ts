import sgMail from "@sendgrid/mail"
import { createFileRoute } from "@tanstack/react-router"
import { buildResponse } from "../../components/server/buildResponse"
import { generateDigestHtml } from "../../components/server/digestHtml"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/email-digest/scheduled-send")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (_session) => {
          const now = new Date()
          const currentHour = now.getUTCHours()
          const currentDay = now.getUTCDay()

          const users = await prisma.user.findMany({
            where: {
              receiveDigestEmails: true,
              digestEmailTimes: { has: currentHour },
              digestEmailDays: { has: currentDay },
            },
          })

          const results: {
            userId: number
            email: string
            sent: boolean
            error?: string
          }[] = []

          for (const user of users) {
            try {
              const membership = await prisma.usersOnOrganizations.findFirst({
                where: { userId: user.id },
                orderBy: { organizationId: "asc" },
              })

              if (membership === null) {
                results.push({
                  userId: user.id,
                  email: user.email,
                  sent: false,
                  error: "No organization",
                })
                continue
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
                subject: `${user.firstName || "User"}'s Expendas Daily`,
                text: "Your daily digest is available.",
                html,
              })

              results.push({ userId: user.id, email: user.email, sent: true })
            } catch (e: any) {
              results.push({
                userId: user.id,
                email: user.email,
                sent: false,
                error: e.message,
              })
            }
          }

          console.log(
            "Digest scheduled send results:",
            JSON.stringify(results, null, 2)
          )

          return {
            sent: results.filter((r) => r.sent).length,
            failed: results.filter((r) => !r.sent).length,
            results,
          }
        })
      },
    },
  },
})
