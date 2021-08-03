import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import { getPaycheckDates } from "../../../../../lib/server/getPaycheckDates"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    // GET
    if (req.method === "GET") {
      return await getPaycheckDates(organizationId)
    }
  })
}

export default withSession(handler)
