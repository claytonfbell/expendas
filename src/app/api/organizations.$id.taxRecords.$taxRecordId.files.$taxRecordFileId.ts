import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/taxRecords/$taxRecordId/files/$taxRecordFileId"
)({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
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
              taxRecord: true,
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

          await prisma.taxRecordFile.delete({
            where: { id: taxRecordFileId },
          })

          return
        })
      },
    },
  },
})