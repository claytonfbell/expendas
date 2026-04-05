import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import validate from "../../../../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const userId = Number(req.query.userId)
    await requireOrganizationAuthentication(req, prisma, organizationId)
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        organizations: {
          some: {
            organizationId,
          },
        },
      },
    })

    validate({ user }).notNull()

    const { firstName, lastName, dateOfBirth, socialSecurityEstimates } =
      req.body

    validate({ firstName }).notNull().min(1)
    validate({ lastName }).notNull().min(1)
    validate({ dateOfBirth }).notNull()

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName,
        lastName,
        dateOfBirth,
        socialSecurityEstimates,
      },
    })
  })
}

export default withSession(handler)
