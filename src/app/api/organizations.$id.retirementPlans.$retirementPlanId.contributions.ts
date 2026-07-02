import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/retirementPlans/$retirementPlanId/contributions"
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
        return await prisma.retirementPlanContribution.findMany({
          where: {
            retirementPlanId,
          },
          include: {
            account: true,
          },
        })
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
  
        const body = await request.json()
        const contributions: { accountId: number; amount: number }[] =
          body.contributions
  
        for (const contribution of contributions) {
          const exist = await prisma.retirementPlanContribution.findFirst({
            where: {
              retirementPlanId,
              accountId: contribution.accountId,
            },
          })
          if (exist) {
            await prisma.retirementPlanContribution.update({
              where: {
                id: exist.id,
              },
              data: {
                amount: contribution.amount,
              },
            })
          } else {
            await prisma.retirementPlanContribution.create({
              data: {
                retirementPlanId,
                accountId: contribution.accountId,
                amount: contribution.amount,
              },
            })
          }
        }
      })
    },
  
    }
  }
})
