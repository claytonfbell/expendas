import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export const Route = createFileRoute("/api/organizations/$id/receipts/$receiptId/open")({
  server: {
    handlers: {
  GET: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const receiptId = Number(params.receiptId)
      await requireOrganizationAuthentication(session, prisma, organizationId)
      const receipt = await prisma.receipt.findUnique({
        where: {
          id: receiptId,
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

      if (!receipt) {
        throw new BadRequestException("Receipt not found.")
      }

      const stream = await getCloudFileStream(
        receipt.organizationCloudFile.cloudFile
      )
      const buffer = await streamToBuffer(stream)

      return new Response(buffer, {
        headers: {
          "Content-Type": receipt.organizationCloudFile.cloudFile.contentType,
          "Content-Disposition": `inline; filename="${receipt.organizationCloudFile.name}"`,
        },
      })
    })
  },

    }
  }
})