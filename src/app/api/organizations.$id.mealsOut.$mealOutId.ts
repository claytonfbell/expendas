import { MealsOut } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/mealsOut/$mealOutId"
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const mealOutId = Number(params.mealOutId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const mealOut = await prisma.mealsOut.findUnique({
            where: { id: mealOutId, organizationId },
          })
          if (!mealOut) {
            throw new BadRequestException("Meal out not found.")
          }
          return mealOut
        })
      },
      PUT: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const mealOutId = Number(params.mealOutId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const body: MealsOut = await request.json()

          validate({ date: body.date }).notEmpty()
          validate({ amount: body.amount }).notEmpty()
          validate({ merchant: body.merchant }).notEmpty()
          validate({ reason: body.reason }).notEmpty()

          await prisma.mealsOut.update({
            data: {
              date: body.date,
              amount: body.amount,
              merchant: body.merchant,
              reason: body.reason,
              notes: body.notes,
            },
            where: { id: mealOutId, organizationId },
          })
        })
      },
      DELETE: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const mealOutId = Number(params.mealOutId)
          await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          await prisma.mealsOut.delete({
            where: { id: mealOutId, organizationId },
          })
        })
      },
    },
  },
})
