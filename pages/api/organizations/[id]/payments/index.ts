import { NextApiResponse } from "next"
import { PaymentForm } from "../../../../../lib/PaymentForm"
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
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    // GET
    if (req.method === "GET") {
      const payments = await prisma.payment.findMany({
        where: {
          account: { organizationId },
        },
        include: { account: true },
        orderBy: { id: "desc" },
      })

      return payments
    }
    // POST
    else if (req.method === "POST") {
      const {
        id,
        description,
        isTransfer,
        accountId2,
        amount,
        ...tmp
      }: PaymentForm = req.body
      validate({ description }).notEmpty()
      validate({ amount }).notEmpty()

      // passed validation
      const payment = await prisma.payment.create({
        data: {
          description,
          amount,
          ...tmp,
        },
        include: { account: true },
      })

      return payment
    }
  })
}

export default withSession(handler)
