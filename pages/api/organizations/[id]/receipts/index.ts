import {
  Account,
  CloudFile,
  OrganizationCloudFile,
  Receipt,
} from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import { putCloudFile } from "../../../../../lib/server/cloudFile"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(req: NextIronRequest, res: NextApiResponse) {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    await requireOrganizationAuthentication(req, prisma, organizationId)

    // GET
    if (req.method === "GET") {
      const receipts: ReceiptWithIncludes[] = await prisma.receipt.findMany({
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
      })
      return receipts
    }
    // POST
    if (req.method === "POST") {
      const {
        fileName,
        fileContentType,
        fileBase64,
        ...data
      }: ReceiptCreateRequest = req.body

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

      // check existing organizationCloudFile
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
            ...data,
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
    }
  })
}

export default withSession(handler)

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
