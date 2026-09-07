import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { deleteCloudFileFromS3 } from "../../components/server/cloudFile"
import { NotFoundException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/backups/$backupId"
)({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
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

          if (!backup || backup.organizationId !== organizationId) {
            throw new NotFoundException("Backup not found")
          }

          if (!backup.cloudFile.deleted) {
            await deleteCloudFileFromS3(backup.cloudFile)
          }
        })
      },
    },
  },
})