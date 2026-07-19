import {
  CloudFile,
  OrganizationCloudFile,
  TaxRecord,
  User,
} from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { putCloudFile } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/taxRecords")({
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
          const taxRecords: TaxRecordWithIncludes[] =
            await prisma.taxRecord.findMany({
              where: {
                organizationCloudFile: {
                  organizationId,
                },
              },
              include: {
                user: true,
                organizationCloudFile: {
                  include: {
                    cloudFile: true,
                  },
                },
              },
            })
          return taxRecords
        })
      },
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const body = await request.json()
          const {
            fileName,
            fileContentType,
            fileBase64,
            ...data
          }: TaxRecordCreateRequest = body

          if (!fileName || !fileContentType || !fileBase64) {
            throw new Error("File data is required")
          }

          const cloudFile = await putCloudFile({
            fileName,
            fileContentType,
            fileBase64,
          })

          if (!cloudFile) {
            throw new Error("Failed to upload file")
          }

          const existing = await prisma.organizationCloudFile.findFirst({
            where: {
              organizationId,
              cloudFileId: cloudFile.id,
              useCase: "TaxRecord",
            },
          })

          let organizationCloudFile: OrganizationCloudFile | null = existing
          if (!existing) {
            organizationCloudFile = await prisma.organizationCloudFile.create({
              data: {
                name: cloudFile.originalName,
                organizationId,
                cloudFileId: cloudFile.id,
                useCase: "TaxRecord",
              },
              include: {
                cloudFile: true,
              },
            })
          }

          if (!organizationCloudFile) {
            throw new Error("Failed to associate file with organization")
          }

          if (!data.userId) {
            throw new Error("User ID is required")
          }

          const taxRecord = await prisma.taxRecord.create({
            data: {
              taxYear: data.taxYear,
              notes: data.notes,
              taxRecordType: data.taxRecordType,
              organizationCloudFile: {
                connect: { id: organizationCloudFile.id },
              },
              user: {
                connect: { id: data.userId },
              },
            },
            include: {
              user: true,
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })
          return taxRecord
        })
      },
    },
  },
})

export type TaxRecordCreateRequest = Omit<
  TaxRecord,
  "id" | "organizationCloudFileId" | "userId"
> & {
  fileName: string | null
  fileContentType: string | null
  fileBase64: string | null
  userId: number | null
}

export type TaxRecordWithIncludes = TaxRecord & {
  user: User
  organizationCloudFile: OrganizationCloudFile & {
    cloudFile: CloudFile
  }
}
