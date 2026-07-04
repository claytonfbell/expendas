import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

async function streamToBuffer(
  stream: NodeJS.ReadableStream
): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export const Route = createFileRoute(
  "/api/organizations/$id/taxRecords/$taxRecordId/open"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taxRecordId = Number(params.taxRecordId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const taxRecord = await prisma.taxRecord.findUnique({
            where: {
              id: taxRecordId,
            },
            include: {
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })

          if (!taxRecord) {
            throw new BadRequestException("Tax record not found.")
          }

          const stream = await getCloudFileStream(
            taxRecord.organizationCloudFile.cloudFile
          )
          const buffer = await streamToBuffer(stream)

          return new Response(buffer, {
            headers: {
              "Content-Type":
                taxRecord.organizationCloudFile.cloudFile.contentType,
              "Content-Disposition": `inline; filename="${taxRecord.organizationCloudFile.name}"`,
            },
          })
        })
      },
    },
  },
})