import { TaxRecord } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/api/organizations/$id/taxRecords/$taxRecordId"
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
              organizationCloudFile: {
                organizationId,
              },
            },
            include: {
              user: true,
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

          return taxRecord
        })
      },
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taxRecordId = Number(params.taxRecordId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const requestBody: TaxRecord = await request.json()

          await prisma.taxRecord.update({
            data: {
              taxYear: requestBody.taxYear,
              userId: requestBody.userId,
              taxRecordType: requestBody.taxRecordType,
              notes: requestBody.notes,
            },
            where: { id: taxRecordId },
            include: {
              user: true,
              organizationCloudFile: {
                include: {
                  cloudFile: true,
                },
              },
            },
          })
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taxRecordId = Number(params.taxRecordId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          await prisma.taxRecord.delete({
            where: { id: taxRecordId },
          })
        })
      },
    },
  },
})