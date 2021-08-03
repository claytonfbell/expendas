import { Item } from "@prisma/client"
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
    const itemId = Number(req.query.itemId)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )

    const item = await prisma.item.findUnique({ where: { id: itemId } })

    // GET
    if (req.method === "GET") {
      return item
    }
    // PUT
    else if (req.method === "PUT") {
      const { amount, isPaid }: Item = req.body
      validate({ amount }).notNull()
      validate({ isPaid }).notNull()

      return await prisma.item.update({
        where: { id: itemId },
        data: {
          amount,
          isPaid,
        },
      })
    }
  })
}

export default withSession(handler)
