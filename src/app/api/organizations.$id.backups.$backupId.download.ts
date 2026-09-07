import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import { NotFoundException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/backups/$backupId/download"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const backupId = Number(params.backupId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const backup = await prisma.dataBackup.findUnique({
            where: { id: backupId },
            include: { cloudFile: true },
          })

          if (
            !backup ||
            backup.organizationId !== organizationId ||
            backup.cloudFile.deleted
          ) {
            throw new NotFoundException("Backup not found")
          }

          const stream = await getCloudFileStream(backup.cloudFile)
          const chunks: Buffer[] = []
          for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          }
          const buffer = Buffer.concat(chunks)

          return new Response(buffer, {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="${backup.cloudFile.originalName}"`,
            },
          })
        })
      },
    },
  },
})