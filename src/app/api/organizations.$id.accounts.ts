import { Account } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute("/api/organizations/$id/accounts")({
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
          const accounts = await prisma.account.findMany({
            where: {
              organizationId,
            },
            include: {
              carryOver: true,
              plaidCredential: { select: { lastUpdated: true } },
              assets: true,
            },
            orderBy: { name: "asc" },
          })
          return accounts
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
            name,
            accountType,
            balance,
            creditCardType,
            accountBucket,
          }: Account = await request.json()
          validate({ name }).notEmpty()
          validate({ accountType }).notEmpty()
          if (accountType === "Investment") {
            validate({ accountBucket }).notEmpty()
          }
          validate({ balance }).notEmpty()
          if (accountType === "Credit_Card") {
            validate({ creditCardType }).notEmpty()
          }

          // check unique
          const exists = await prisma.account.findFirst({
            where: {
              name: { equals: name },
              accountType: { equals: accountType },
              organizationId: { equals: organizationId },
            },
          })
          if (exists !== null) {
            throw new BadRequestException("Account name is already used.")
          }

          // passed validation
          const account = await prisma.account.create({
            data: {
              organizationId,
              name,
              accountType,
              balance,
              creditCardType,
              accountBucket,
            },
          })

          return account
        })
      },
    },
  },
})
