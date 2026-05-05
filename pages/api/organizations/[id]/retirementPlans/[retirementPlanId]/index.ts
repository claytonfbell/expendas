import { RetirementPlanType } from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import prisma from "../../../../../../lib/server/prisma"
import withSession, {
  NextIronRequest,
} from "../../../../../../lib/server/session"
import validate from "../../../../../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const retirementPlanId = Number(req.query.retirementPlanId)
    await requireOrganizationAuthentication(req, prisma, organizationId)
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

    // GET
    if (req.method === "GET") {
      return retirementPlan
    }
    // PUT
    else if (req.method === "PUT") {
      // first validate input
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
      } = req.body as RetirementPlanUpdateRequest

      validate({ name }).notEmpty()
      // check unique
      //   const exists = await prisma.retirementPlan.findFirst({
      //     where: {
      //       name: { equals: name },
      //       organizationId: { equals: organizationId },
      //       id: { not: { equals: retirementPlanId } },
      //     },
      //   })
      //   if (exists !== null) {
      //     throw new BadRequestException("Retirement plan name is already used.")
      //   }

      // passed validation - update
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

      // refetch with includes
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
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.retirementPlan.delete({
        where: { id: retirementPlanId },
      })
    }
  })
}

export default withSession(handler)

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
