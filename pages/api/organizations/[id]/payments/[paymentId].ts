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
      include: { account: true },
    })
    validate({ payment }).notNull()

    // GET
    if (req.method === "GET") {
      return payment
    }
    // PUT
    else if (req.method === "PUT") {
      const {
        id,
        description,
        accountId,
        amount,
        date,
        isPaycheck,
        repeatsOnDates,
        repeatsUntilDate,
        repeatsOnDaysOfMonth,
        repeatsOnMonthsOfYear,
        repeatsWeekly,
      }: Payment = req.body
      validate({ description }).notEmpty()
      validate({ accountId }).notEmpty()
      validate({ amount }).notEmpty()
      validate({ date }).notEmpty()
      validate({ isPaycheck }).notEmpty()
      validate({ repeatsOnDaysOfMonth }).notEmpty()
      validate({ repeatsOnMonthsOfYear }).notEmpty()
      validate({ repeatsOnDates }).notEmpty()

      // passed validation
      const payment = await prisma.payment.update({
        data: {
          description,
          accountId,
          amount,
          date,
          isPaycheck,
          repeatsOnDates,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsUntilDate,
          repeatsWeekly,
        },
        include: { account: true },
        where: { id: paymentId },
      })

      // wipe out all items if this is a paycheck that was edited, in case the pay periods have changed
      if (isPaycheck) {
        await prisma.item.deleteMany({
          where: { payment: { account: { organizationId } } },
        })
      }
      // wipe out items for this specific payment
      else {
        await prisma.item.deleteMany({ where: { paymentId } })
      }

      return payment
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.item.deleteMany({ where: { paymentId } })

      await prisma.payment.delete({
        where: { id: paymentId },
      })
    }
  })
}

export default withSession(handler)
