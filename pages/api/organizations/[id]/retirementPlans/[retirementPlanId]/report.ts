import { RetirementPlan, RetirementPlanUser, User } from "@prisma/client"
import moment from "moment"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import { getFiDateAndAmountsForRetirementPlan } from "../../../../../../lib/server/getFiDateAndAmountsForRetirementPlan"
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
      if (retirementPlan !== null) {
        const dateAndAmounts =
          await getFiDateAndAmountsForRetirementPlan(retirementPlan)

        const projection = await getRetirementPlanProjection(retirementPlan)
        return { dateAndAmounts, projection }
      } else {
        throw new Error("Retirement plan not found")
      }
    }
  })
}

export default withSession(handler)

async function getRetirementPlanProjection(
  retirementPlan: RetirementPlan & {
    retirementPlanUsers: (RetirementPlanUser & {
      user: User
    })[]
  }
) {
  // get date of when youngest user turns 100
  const users = retirementPlan.retirementPlanUsers.map((rpu) => rpu.user)
  console.log("users", users)
  const youngestUser = users.reduce(
    (youngest, user) => {
      if (
        !youngest ||
        (user.dateOfBirth &&
          youngest.dateOfBirth &&
          user.dateOfBirth > youngest.dateOfBirth)
      ) {
        return user
      }
      return youngest
    },
    null as User | null
  )
  if (youngestUser && youngestUser.dateOfBirth) {
    const rows: any[] = []

    const endMonth = moment(youngestUser.dateOfBirth)
      .add(100, "years")
      .startOf("month")

    const month = moment().startOf("month")
    while (month.isBefore(endMonth)) {
      console.log("checking month", month.format("YYYY-MM-DD"))
      rows.push({
        date: month.format("YYYY-MM-DD"),
      })
      month.add(1, "month")
    }
    return rows
  } else {
    throw new Error("No users in retirement plan")
  }
}
