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
      return await prisma.retirementPlanContribution.findMany({
        where: {
          retirementPlanId,
        },
        include: {
          account: true,
        },
      })
    }
    // PUT
    else if (req.method === "PUT") {
      const contributions: { accountId: number; amount: number }[] =
        req.body.contributions

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
    }
    // // DELETE
    // else if (req.method === "DELETE") {
    //   await prisma.retirementPlan.delete({
    //     where: { id: retirementPlanId },
    //   })
    // }
  })
}

export default withSession(handler)
