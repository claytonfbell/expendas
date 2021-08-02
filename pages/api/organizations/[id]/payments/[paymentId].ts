import { Payment } from "@prisma/client"
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
    const paymentId = Number(req.query.paymentId)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    })
    validate({ payment }).notNull()

    // GET
    if (req.method === "GET") {
      return payment
    }
    // PUT
    else if (req.method === "PUT") {
      const { description, id, ...tmp }: Payment = req.body
      validate({ description }).notEmpty()

      // passed validation
      const payment = await prisma.payment.update({
        data: {
          description,
          ...tmp,
        },
        where: { id: paymentId },
      })

      return payment
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.payment.delete({
        where: { id: paymentId },
      })
    }
  })
}

export default withSession(handler)
