import { Payment } from "@prisma/client"
import dayjs from "../../../lib/dayjs"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { filterPaymentsOnDate } from "../../../lib/server/filterPaymentsOnDate"
import { getPaycheckDates } from "../../../lib/server/getPaycheckDates"
import prisma from "../../../lib/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/dates/$date")({
  server: {
    handlers: {
  async GET({ request, params }) {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const date = params.date as string
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )
      const dates = await getPaycheckDates(organizationId)
      const endDate = dates[dates.indexOf(date) + 1]

      const allPayments = await prisma.payment.findMany({
        where: {
          account: { organizationId },
        },
      })

      const payments: Payment[] = []
      let cursor = dayjs(date).tz("America/Los_Angeles")
      while (cursor.isBefore(endDate)) {
        payments.push(...filterPaymentsOnDate(allPayments, cursor))
        cursor = cursor.add(1, "days")
      }

      const items = await prisma.item.findMany({
        where: { payment: { account: { organizationId } }, date },
      })

      items
        .filter(
          (x) => payments.filter((y) => y.id === x.paymentId).length === 0
        )
        .forEach(async (x) => {
          console.log(`removing ${x.id}`)
          await prisma.item.delete({ where: { id: x.id } })
        })

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

      const refetchedItems = await prisma.item.findMany({
        where: { payment: { account: { organizationId } }, date },
        include: { payment: { include: { account: true } } },
      })
      return refetchedItems
    })
  },

    }
  }
})
