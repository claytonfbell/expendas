import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { generateOrganizationZipBuffer } from "../../components/server/generateBackupZip"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/export")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const { buffer: zipBuffer, organizationName } =
            await generateOrganizationZipBuffer(organizationId)

          return new Response(zipBuffer, {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="${organizationName ?? "organization"}-export.zip"`,
            },
          })
        })
      },
    },
  },
})