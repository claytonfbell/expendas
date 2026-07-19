import {
  Account,
  CloudFile,
  OrganizationCloudFile,
  Receipt,
} from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { putCloudFile } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/receipts")({
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
          const receipts: ReceiptWithIncludes[] = await prisma.receipt.findMany(
            {
              where: {
                organizationCloudFile: {
                  organizationId,
                },
              },
              include: {
                account: true,
                organizationCloudFile: {
                  include: {
                    cloudFile: true,
                  },
                },
              },
            }
          )
          return receipts
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
          }: ReceiptCreateRequest = body

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
              useCase: "Receipt",
            },
          })

          let organizationCloudFile: OrganizationCloudFile | null = existing
          if (!existing) {
            organizationCloudFile = await prisma.organizationCloudFile.create({
              data: {
                name: cloudFile.originalName,
                organizationId,
                cloudFileId: cloudFile.id,
                useCase: "Receipt",
              },
              include: {
                cloudFile: true,
              },
            })
          }

          if (!organizationCloudFile) {
            throw new Error("Failed to associate file with organization")
          }

          if (!data.accountId) {
            throw new Error("Account ID is required")
          }

          const receipt = await prisma.receipt.create({
            data: {
              ...data,
              organizationCloudFileId: organizationCloudFile.id,
              accountId: data.accountId,
            },
            include: {
              account: true,
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })
          return receipt
        })
      },
    },
  },
})

export type ReceiptCreateRequest = Omit<
  Receipt,
  "id" | "organizationCloudFileId" | "accountId"
> & {
  fileName: string | null
  fileContentType: string | null
  fileBase64: string | null
  accountId: number | null
}

export type ReceiptWithIncludes = Receipt & {
  account: Account
  organizationCloudFile: OrganizationCloudFile & {
    cloudFile: CloudFile
  }
}
