import { PaymentForm } from "../../components/PaymentForm"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id/payments")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const payments = await prisma.payment.findMany({
            where: {
              account: { organizationId },
            },
            include: { account: true },
            orderBy: { id: "desc" },
          })

          return payments
        })
      },
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const {
            id,
            description,
            isTransfer,
            accountId2,
            amount,
            ...tmp
          }: PaymentForm = await request.json()
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
        })
      },
    },
  },
})
