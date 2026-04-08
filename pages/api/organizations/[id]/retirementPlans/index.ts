import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import { BadRequestException } from "../../../../../lib/server/HttpException"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import validate from "../../../../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    await requireOrganizationAuthentication(req, prisma, organizationId)
    // GET
    if (req.method === "GET") {
      const retirementPlans = await prisma.retirementPlan.findMany({
        where: {
          organizationId,
        },
        orderBy: {
          id: "asc",
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
      return retirementPlans
    }
    // POST
    else if (req.method === "POST") {
      const name = req.body.name as string
      const copyPlanId = req.body.copyPlanId as number | null
      validate({ name }).notEmpty()

      // check unique
      const exists = await prisma.retirementPlan.findFirst({
        where: {
          name: { equals: name },
          organizationId: { equals: organizationId },
        },
      })
      if (exists !== null) {
        throw new BadRequestException("Retirement plan name is already used.")
      }

      // if copyPlanId provided, validate it and copy settings and contributions
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

        // passed checks, create new plan with copied settings and contributions
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
        // passed checks, create new plan with default settings
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
    }
  })
}

export default withSession(handler)
