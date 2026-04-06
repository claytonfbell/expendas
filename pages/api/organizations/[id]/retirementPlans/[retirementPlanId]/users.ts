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
      return await prisma.retirementPlanUser.findMany({
        where: {
          retirementPlanId,
        },
        include: {
          user: true,
        },
      })
    }
    // PUT
    else if (req.method === "PUT") {
      const planUsers: { userId: number; collectSocialSecurityAge: number }[] =
        req.body.users

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
    }
  })
}

export default withSession(handler)
