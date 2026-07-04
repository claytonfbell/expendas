import { MealsOut } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/mealsOut"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const mealsOut = await prisma.mealsOut.findMany({
            where: { organizationId },
            orderBy: { date: "desc" },
          })
          return mealsOut
        })
      },
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const body: MealsOutCreateRequest = await request.json()

          validate({ date: body.date }).notEmpty()
          validate({ amount: body.amount }).notEmpty()
          validate({ merchant: body.merchant }).notEmpty()
          validate({ reason: body.reason }).notEmpty()

          const mealOut = await prisma.mealsOut.create({
            data: {
              organizationId,
              date: body.date,
              amount: body.amount,
              merchant: body.merchant,
              reason: body.reason,
              notes: body.notes,
            },
          })
          return mealOut
        })
      },
    },
  },
})

export type MealsOutCreateRequest = Omit<MealsOut, "id" | "organizationId">