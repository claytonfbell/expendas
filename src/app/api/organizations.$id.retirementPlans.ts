import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { retirementPlanTypes } from "../../components/retirementPlanTypes"
import { buildResponse } from "../../components/server/buildResponse"
import { BadRequestException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/retirementPlans"
)({
  server: {
    handlers: {  
    GET: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const retirementPlans = (
          await prisma.retirementPlan.findMany({
            where: {
              organizationId,
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
        )
          .sort((a, b) => {
            const retirementPlanTypeIndexA = retirementPlanTypes.indexOf(
              a.retirementPlanType
            )
            const retirementPlanTypeIndexB = retirementPlanTypes.indexOf(
              b.retirementPlanType
            )
            if (retirementPlanTypeIndexA !== retirementPlanTypeIndexB) {
              return retirementPlanTypeIndexA - retirementPlanTypeIndexB
            } else if (a.coastDate === null && b.coastDate !== null) {
              return -1
            } else if (a.coastDate !== null && b.coastDate === null) {
              return 1
            } else {
              return a.name.localeCompare(b.name)
            }
          })
        return retirementPlans
      })
    },
    POST: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        await requireOrganizationAuthentication(session, prisma, organizationId)
        const body = await request.json()
        const name = body.name as string
        const copyPlanId = body.copyPlanId as number | null
        validate({ name }).notEmpty()
  
        if (copyPlanId) {
          const copyPlan = await prisma.retirementPlan.findFirst({
            where: {
              id: copyPlanId,
              organizationId,
            },
            include: {
              retirementPlanContributions: true,
              retirementPlanUsers: true,
            },
          })
          if (!copyPlan) {
            throw new BadRequestException("Copy plan not found.")
          }
  
          const retirementPlan = await prisma.retirementPlan.create({
            data: {
              organizationId,
              name,
              desiredIncome: copyPlan.desiredIncome,
              healthInsuranceEstimate: copyPlan.healthInsuranceEstimate,
              stockAppreciationEstimate: copyPlan.stockAppreciationEstimate,
              dividendYieldEstimate: copyPlan.dividendYieldEstimate,
              inflationRateEstimate: copyPlan.inflationRateEstimate,
              withdrawalRateEstimate: copyPlan.withdrawalRateEstimate,
              retirementPlanType: copyPlan.retirementPlanType,
              coastDate: copyPlan.coastDate,
              retirementPlanContributions: {
                create: copyPlan.retirementPlanContributions.map(
                  (contribution) => ({
                    accountId: contribution.accountId,
                    amount: contribution.amount,
                  })
                ),
              },
              retirementPlanUsers: {
                create: copyPlan.retirementPlanUsers.map((user) => ({
                  userId: user.userId,
                })),
              },
            },
          })
          return retirementPlan
        } else {
          const retirementPlan = await prisma.retirementPlan.create({
            data: {
              organizationId,
              name,
              desiredIncome: 100_000_00,
              healthInsuranceEstimate: 1_000_00,
              stockAppreciationEstimate: 9_000,
              dividendYieldEstimate: 1_200,
              inflationRateEstimate: 2_500,
              withdrawalRateEstimate: 4_000,
            },
          })
          return retirementPlan
        }
      })
    },
  
    }
  }
})
