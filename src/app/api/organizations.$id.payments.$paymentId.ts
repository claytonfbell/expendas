import { Payment } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/api/organizations/$id/payments/$paymentId"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const paymentId = Number(params.paymentId)
          const user = await requireOrganizationAuthentication(
            session,
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

          return payment
        })
      },
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const paymentId = Number(params.paymentId)
          const user = await requireOrganizationAuthentication(
            session,
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
          }: Payment = await request.json()
          validate({ description }).notEmpty()
          validate({ accountId }).notEmpty()
          validate({ amount }).notEmpty()
          validate({ date }).notEmpty()
          validate({ isPaycheck }).notEmpty()
          validate({ repeatsOnDaysOfMonth }).notEmpty()
          validate({ repeatsOnMonthsOfYear }).notEmpty()
          validate({ repeatsOnDates }).notEmpty()

          // passed validation
          const updatedPayment = await prisma.payment.update({
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

          return updatedPayment
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const paymentId = Number(params.paymentId)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          await prisma.item.deleteMany({ where: { paymentId } })

          await prisma.payment.delete({
            where: { id: paymentId },
          })
        })
      },
    },
  },
})
