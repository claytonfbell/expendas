import { Account } from "@prisma/client"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { BadRequestException } from "../../../lib/server/HttpException"
import { autoUpdateInvestmentAccountBalances } from "../../../lib/server/autoUpdateInvestmentAccountBalances"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import { updateAccountBalanceHistory } from "../../../lib/server/updateAccountBalanceHistory"
import validate from "../../../lib/server/validate"
import { createFileRoute } from "@tanstack/react-router"

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
      await autoUpdateInvestmentAccountBalances()
      await updateAccountBalanceHistory(organizationId)

      const accounts = await prisma.account.findMany({
        where: {
          organizationId,
        },
        include: {
          carryOver: true,
          plaidCredential: { select: { lastUpdated: true } },
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

    }
  }
})
