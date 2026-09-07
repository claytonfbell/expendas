import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/insurancePolicies/$insurancePolicyId/files/$insurancePolicyFileId"
)({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
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

          await prisma.insurancePolicyFile.delete({
            where: { id: insurancePolicyFileId },
          })
        })
      },
    },
  },
})