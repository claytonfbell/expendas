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
  "/api/organizations/$id/insurancePolicies/$insurancePolicyId/files/$insurancePolicyFileId/open"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const insurancePolicyFileId = Number(params.insurancePolicyFileId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const insurancePolicyFile =
            await prisma.insurancePolicyFile.findUnique({
              where: { id: insurancePolicyFileId },
              include: {
                organizationCloudFile: {
                  include: {
                    cloudFile: true,
                  },
                },
              },
            })

          if (!insurancePolicyFile) {
            throw new BadRequestException("Insurance policy file not found.")
          }

          const stream = await getCloudFileStream(
            insurancePolicyFile.organizationCloudFile.cloudFile
          )
          const buffer = await streamToBuffer(stream)

          return new Response(buffer, {
            headers: {
              "Content-Type":
                insurancePolicyFile.organizationCloudFile.cloudFile.contentType,
              "Content-Disposition": `inline; filename="${insurancePolicyFile.organizationCloudFile.name}"`,
            },
          })
        })
      },
    },
  },
})