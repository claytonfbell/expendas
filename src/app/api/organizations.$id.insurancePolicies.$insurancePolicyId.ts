import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import type { InsurancePolicyWithIncludes } from "./organizations.$id.insurancePolicies"

export const Route = createFileRoute(
  "/api/organizations/$id/insurancePolicies/$insurancePolicyId"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const insurancePolicyId = Number(params.insurancePolicyId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const insurancePolicy = await prisma.insurancePolicy.findFirst({
            where: { id: insurancePolicyId, organizationId },
            include: {
              user: true,
              insurancePolicyFiles: {
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
          if (!insurancePolicy) {
            throw new BadRequestException("Insurance policy not found.")
          }
          return insurancePolicy as InsurancePolicyWithIncludes
        })
      },
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const insurancePolicyId = Number(params.insurancePolicyId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const body = await request.json()

          validate({ company: body.company }).notEmpty()
          validate({ policyNumber: body.policyNumber }).notEmpty()
          validate({ type: body.type }).notEmpty()
          validate({ amount: body.amount }).notEmpty()
          validate({ userId: body.userId }).notEmpty()

          const insurancePolicy = await prisma.insurancePolicy.update({
            data: {
              company: body.company,
              policyNumber: body.policyNumber,
              type: body.type,
              termYears: body.termYears,
              termEnd: body.termEnd,
              amount: body.amount,
              premium: body.premium,
              notes: body.notes,
              userId: body.userId,
            },
            where: { id: insurancePolicyId },
            include: {
              user: true,
              insurancePolicyFiles: {
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
          return insurancePolicy as InsurancePolicyWithIncludes
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const insurancePolicyId = Number(params.insurancePolicyId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          await prisma.insurancePolicy.delete({
            where: { id: insurancePolicyId },
          })
        })
      },
    },
  },
})