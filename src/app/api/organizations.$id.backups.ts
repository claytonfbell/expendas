import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import {
  deleteCloudFileFromS3,
  putCloudFileBuffer,
} from "../../components/server/cloudFile"
import { generateOrganizationZipBuffer } from "../../components/server/generateBackupZip"
import prisma from "../../components/server/prisma"

const MAX_BACKUPS = 10

export const backupInclude = {
  cloudFile: true,
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
}

export type BackupWithIncludes = Awaited<
  ReturnType<
    typeof prisma.dataBackup.findFirst<{
      include: typeof backupInclude
    }>
  >
>

export const Route = createFileRoute("/api/organizations/$id/backups")({
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

          const backups = await prisma.dataBackup.findMany({
            where: { organizationId },
            include: backupInclude,
            orderBy: { createdAt: "desc" },
          })

          return backups
        })
      },

      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const { buffer: zipBuffer, organizationName } =
            await generateOrganizationZipBuffer(organizationId)

          const fileName = `${organizationName ?? "organization"}-backup-${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.zip`

          const cloudFile = await putCloudFileBuffer({
            fileName,
            fileContentType: "application/zip",
            buffer: zipBuffer,
          })

          const backup = await prisma.dataBackup.create({
            data: {
              organizationId,
              cloudFileId: cloudFile.id,
              createdByUserId: user.id,
            },
            include: backupInclude,
          })

          const allBackups = await prisma.dataBackup.findMany({
            where: { organizationId },
            include: { cloudFile: true },
            orderBy: { createdAt: "desc" },
          })

          if (allBackups.length > MAX_BACKUPS) {
            const oldBackups = allBackups.slice(MAX_BACKUPS)
            for (const oldBackup of oldBackups) {
              if (!oldBackup.cloudFile.deleted) {
                await deleteCloudFileFromS3(oldBackup.cloudFile)
              }
            }
          }

          return backup
        })
      },
    },
  },
})