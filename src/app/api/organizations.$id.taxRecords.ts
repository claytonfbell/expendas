import {
  CloudFile,
  OrganizationCloudFile,
  TaxRecord,
  TaxRecordFile,
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
                taxRecordFiles: {
                  some: {
                    organizationCloudFile: {
                      organizationId,
                    },
                  },
                },
              },
              orderBy: [
                { taxYear: "desc" },
                { user: { lastName: "asc" } },
                { user: { firstName: "asc" } },
              ],
              include: {
                user: true,
                taxRecordFiles: {
                  include: {
                    organizationCloudFile: {
                      include: {
                        cloudFile: true,
                      },
                    },
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
          const { files, ...data }: TaxRecordCreateRequest = body

          if (!files || files.length === 0) {
            throw new Error("At least one file is required")
          }

          if (!data.userId) {
            throw new Error("User ID is required")
          }

          // Upload all files and create/find OrganizationCloudFile records
          const organizationCloudFileIds: number[] = []
          for (const file of files) {
            if (!file.fileName || !file.fileContentType || !file.fileBase64) {
              throw new Error("File data is required for all files")
            }

            const cloudFile = await putCloudFile({
              fileName: file.fileName,
              fileContentType: file.fileContentType,
              fileBase64: file.fileBase64,
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

            organizationCloudFileIds.push(organizationCloudFile.id)
          }

          const taxRecord = await prisma.taxRecord.create({
            data: {
              taxYear: data.taxYear,
              notes: data.notes,
              user: {
                connect: { id: data.userId },
              },
              taxRecordFiles: {
                create: organizationCloudFileIds.map(
                  (organizationCloudFileId) => ({
                    organizationCloudFileId,
                  })
                ),
              },
            },
            include: {
              user: true,
              taxRecordFiles: {
                include: {
                  organizationCloudFile: {
                    include: {
                      cloudFile: true,
                    },
                  },
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

export interface FileUpload {
  fileName: string
  fileContentType: string
  fileBase64: string
}

export type TaxRecordCreateRequest = Omit<
  TaxRecord,
  "id" | "userId" | "taxRecordFiles"
> & {
  userId: number | null
  files: FileUpload[]
}

export type TaxRecordWithIncludes = TaxRecord & {
  user: User
  taxRecordFiles: (TaxRecordFile & {
    organizationCloudFile: OrganizationCloudFile & {
      cloudFile: CloudFile
    }
  })[]
}