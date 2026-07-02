import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/retirementPlans/$retirementPlanId/users"
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
        return await prisma.retirementPlanUser.findMany({
          where: {
            retirementPlanId,
          },
          include: {
            user: true,
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
        const planUsers: { userId: number; collectSocialSecurityAge: number }[] =
          body.users
  
        for (const planUser of planUsers) {
          const exist = await prisma.retirementPlanUser.findFirst({
            where: {
              retirementPlanId,
              userId: planUser.userId,
            },
          })
          if (exist) {
            await prisma.retirementPlanUser.update({
              where: {
                id: exist.id,
              },
              data: {
                collectSocialSecurityAge: planUser.collectSocialSecurityAge,
              },
            })
          } else {
            await prisma.retirementPlanUser.create({
              data: {
                retirementPlanId,
                userId: planUser.userId,
                collectSocialSecurityAge: planUser.collectSocialSecurityAge,
              },
            })
          }
        }
      })
    },
  
    }
  }
})
