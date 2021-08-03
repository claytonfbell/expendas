import { Payment } from "@prisma/client"
import moment from "moment"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import { filterPaymentsOnDate } from "../../../../../../lib/server/filterPaymentsOnDate"
import { getPaycheckDates } from "../../../../../../lib/server/getPaycheckDates"
import prisma from "../../../../../../lib/server/prisma"
import withSession, {
  NextIronRequest,
} from "../../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const date = req.query.date as string
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    // GET
    if (req.method === "GET") {
      const dates = await getPaycheckDates(organizationId)
      const endDate = dates[dates.indexOf(date) + 1]

      const allPayments = await prisma.payment.findMany({
        where: {
          account: { organizationId },
        },
      })

      // GO FORWARDS
      const payments: Payment[] = []
      let cursor = moment(date).tz("America/Los_Angeles")
      while (cursor.isBefore(endDate)) {
        payments.push(...filterPaymentsOnDate(allPayments, cursor))
        cursor.add(1, "days")
      }

      // find existing items
      const items = await prisma.item.findMany({
        where: { payment: { account: { organizationId } }, date },
      })

      // remove items that don't have payments
      items
        .filter(
          (x) => payments.filter((y) => y.id === x.paymentId).length === 0
        )
        .forEach(async (x) => {
          console.log(`removing ${x.id}`)
          await prisma.item.delete({ where: { id: x.id } })
        })

      // add items that don't exist
      const addThese = payments.filter(
        (x) => items.filter((y) => y.paymentId === x.id).length === 0
      )
      for (let i = 0; i < addThese.length; i++) {
        const p = addThese[i]
        await prisma.item.create({
          data: {
            paymentId: p.id,
            date,
            amount: p.amount,
            isPaid: false,
          },
        })
      }

      // now fetch items again
      const refetchedItems = await prisma.item.findMany({
        where: { payment: { account: { organizationId } }, date },
        include: { payment: { include: { account: true } } },
      })
      return refetchedItems
    }
  })
}

export default withSession(handler)
