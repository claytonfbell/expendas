import {
  CloudFile,
  InsurancePolicy,
  InsurancePolicyFile,
  OrganizationCloudFile,
  User,
} from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute("/api/organizations/$id/insurancePolicies")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const insurancePolicies: InsurancePolicyWithIncludes[] =
            await prisma.insurancePolicy.findMany({
              where: { organizationId },
              orderBy: [{ company: "asc" }, { user: { lastName: "asc" } }],
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
          return insurancePolicies
        })
      },
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const body: InsurancePolicyCreateRequest = await request.json()

          validate({ company: body.company }).notEmpty()
          validate({ policyNumber: body.policyNumber }).notEmpty()
          validate({ type: body.type }).notEmpty()
          validate({ amount: body.amount }).notEmpty()
          validate({ userId: body.userId }).notEmpty()

          const insurancePolicy = await prisma.insurancePolicy.create({
            data: {
              organizationId,
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
          return insurancePolicy
        })
      },
    },
  },
})

export type InsurancePolicyCreateRequest = Omit<
  InsurancePolicy,
  "id" | "organizationId" | "insurancePolicyFiles"
> & {
  insurancePolicyFiles?: never
}

export type InsurancePolicyFileWithIncludes = InsurancePolicyFile & {
  organizationCloudFile: OrganizationCloudFile & {
    cloudFile: CloudFile
  }
}

export type InsurancePolicyWithIncludes = InsurancePolicy & {
  user: User
  insurancePolicyFiles: InsurancePolicyFileWithIncludes[]
}