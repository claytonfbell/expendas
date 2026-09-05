import { createRequire } from "node:module"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import { getCloudFileStream } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

const { ZipArchive } = createRequire(import.meta.url)("archiver")

function sanitizeName(...parts: (string | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .map((p) => p!.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("-")
}

export const Route = createFileRoute(
  "/api/organizations/$id/taxRecords/$taxRecordId/download"
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

          if (!taxRecord) {
            throw new BadRequestException("Tax record not found.")
          }

          const archive = new ZipArchive({ zlib: { level: 9 } })
          const chunks: Buffer[] = []
          archive.on("data", (chunk: Buffer) => chunks.push(chunk))

          const zipName = sanitizeName(
            taxRecord.taxYear,
            taxRecord.user.firstName,
            taxRecord.user.lastName
          )

          for (const taxRecordFile of taxRecord.taxRecordFiles) {
            const { organizationCloudFile } = taxRecordFile
            try {
              const stream = await getCloudFileStream(
                organizationCloudFile.cloudFile
              )
              const fileChunks: Buffer[] = []
              for await (const chunk of stream) {
                fileChunks.push(
                  Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
                )
              }
              archive.append(Buffer.concat(fileChunks), {
                name: `${zipName}/${organizationCloudFile.name}`,
              })
            } catch {
              archive.append("File not available", {
                name: `${zipName}/${organizationCloudFile.name}.error.txt`,
              })
            }
          }

          await archive.finalize()
          const zipBuffer = Buffer.concat(chunks)

          return new Response(zipBuffer, {
            headers: {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename="${zipName}.zip"`,
            },
          })
        })
      },
    },
  },
})