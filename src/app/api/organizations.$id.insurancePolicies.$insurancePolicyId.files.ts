import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { putCloudFile } from "../../components/server/cloudFile"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/insurancePolicies/$insurancePolicyId/files"
)({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const insurancePolicyId = Number(params.insurancePolicyId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const body = await request.json()
          const { fileName, fileContentType, fileBase64 } = body

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

          let organizationCloudFile =
            await prisma.organizationCloudFile.findFirst({
              where: {
                organizationId,
                cloudFileId: cloudFile.id,
                useCase: "InsurancePolicy",
              },
            })

          if (!organizationCloudFile) {
            organizationCloudFile = await prisma.organizationCloudFile.create({
              data: {
                name: cloudFile.originalName,
                organizationId,
                cloudFileId: cloudFile.id,
                useCase: "InsurancePolicy",
              },
              include: {
                cloudFile: true,
              },
            })
          }

          const insurancePolicyFile = await prisma.insurancePolicyFile.create({
            data: {
              insurancePolicyId,
              organizationCloudFileId: organizationCloudFile.id,
            },
            include: {
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })

          return insurancePolicyFile
        })
      },
    },
  },
})