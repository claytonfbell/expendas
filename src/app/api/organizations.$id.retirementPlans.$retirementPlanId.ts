import { RetirementPlanType } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/retirementPlans/$retirementPlanId"
)({
  server: {
    handlers: {  
    GET: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const retirementPlanId = Number(params.retirementPlanId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const retirementPlan = await prisma.retirementPlan.findUnique({
          where: {
            id: retirementPlanId,
          },
          include: {
            retirementPlanUsers: {
              include: {
                user: true,
              },
            },
            retirementPlanContributions: {
              include: {
                account: true,
              },
            },
          },
        })
        validate({ retirementPlan }).notNull()
        return retirementPlan
      })
    },
    PUT: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const retirementPlanId = Number(params.retirementPlanId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const retirementPlan = await prisma.retirementPlan.findUnique({
          where: {
            id: retirementPlanId,
          },
          include: {
            retirementPlanUsers: {
              include: {
                user: true,
              },
            },
            retirementPlanContributions: {
              include: {
                account: true,
              },
            },
          },
        })
        validate({ retirementPlan }).notNull()
  
        const {
          name,
          desiredIncome,
          healthInsuranceEstimate,
          stockAppreciationEstimate,
          dividendYieldEstimate,
          inflationRateEstimate,
          withdrawalRateEstimate,
          retirementPlanType,
          coastDate,
        } = (await request.json()) as RetirementPlanUpdateRequest
  
        validate({ name }).notEmpty()
  
        await prisma.retirementPlan.update({
          data: {
            name,
            desiredIncome,
            healthInsuranceEstimate,
            stockAppreciationEstimate,
            dividendYieldEstimate,
            inflationRateEstimate,
            withdrawalRateEstimate,
            retirementPlanType,
            coastDate,
          },
          where: { id: retirementPlanId },
        })
  
        return await prisma.retirementPlan.findUnique({
          where: {
            id: retirementPlanId,
          },
          include: {
            retirementPlanUsers: {
              include: {
                user: true,
              },
            },
            retirementPlanContributions: {
              include: {
                account: true,
              },
            },
          },
        })
      })
    },
    DELETE: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const retirementPlanId = Number(params.retirementPlanId)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        await prisma.retirementPlan.delete({
          where: { id: retirementPlanId },
        })
      })
    },
  
    }
  }
})

export type RetirementPlanUpdateRequest = {
  id: number
  name: string
  desiredIncome: number
  healthInsuranceEstimate: number
  stockAppreciationEstimate: number
  dividendYieldEstimate: number
  inflationRateEstimate: number
  withdrawalRateEstimate: number
  retirementPlanType: RetirementPlanType
  coastDate: string | null
}
