import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

export const Route = createFileRoute(
  "/api/organizations/$id/taxRecords/$taxRecordId/files/$taxRecordFileId/open"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taxRecordFileId = Number(params.taxRecordFileId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const taxRecordFile = await prisma.taxRecordFile.findUnique({
            where: { id: taxRecordFileId },
            include: {
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })

          if (!taxRecordFile) {
            throw new BadRequestException("Tax record file not found.")
          }

          const stream = await getCloudFileStream(
            taxRecordFile.organizationCloudFile.cloudFile
          )
          const buffer = await streamToBuffer(stream)

          return new Response(buffer, {
            headers: {
              "Content-Type":
                taxRecordFile.organizationCloudFile.cloudFile.contentType,
              "Content-Disposition": `inline; filename="${taxRecordFile.organizationCloudFile.name}"`,
            },
          })
        })
      },
    },
  },
})