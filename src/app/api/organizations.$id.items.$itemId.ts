import { Item } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute("/api/organizations/$id/items/$itemId")({
  server: {
    handlers: {
  async GET({ request, params }) {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const itemId = Number(params.itemId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )

      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { payment: { include: { account: true } } },
      })

      return item
    })
  },
  async PUT({ request, params }) {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const itemId = Number(params.itemId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )

      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: { payment: { include: { account: true } } },
      })

      const { amount, isPaid }: Item = await request.json()
      validate({ amount }).notNull()
      validate({ isPaid }).notNull()

      return await prisma.item.update({
        where: { id: itemId },
        data: {
          amount,
          isPaid,
        },
        include: { payment: { include: { account: true } } },
      })
    })
  },

    }
  }
})
