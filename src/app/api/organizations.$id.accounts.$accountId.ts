import { TickerPrice } from "@prisma/client"
import { AccountWithIncludes } from "../../../lib/AccountWithIncludes"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { BadRequestException } from "../../../lib/server/HttpException"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import { getLatestTickerPrice } from "../../../lib/server/tickerPrices"
import validate from "../../../lib/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id/accounts/$accountId")({
  server: {
    handlers: {
  GET: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const accountId = Number(params.accountId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )
      const account = await prisma.account.findUnique({
        where: {
          id: accountId,
        },
        include: {
          carryOver: true,
          plaidCredential: { select: { lastUpdated: true } },
        },
      })
      validate({ account }).notNull()

      return account
    })
  },
  PUT: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const accountId = Number(params.accountId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )
      const account = await prisma.account.findUnique({
        where: {
          id: accountId,
        },
        include: {
          carryOver: true,
          plaidCredential: { select: { lastUpdated: true } },
        },
      })
      validate({ account }).notNull()

      const {
        name,
        accountType,
        accountBucket,
        balance,
        creditCardType,
        carryOver,
        totalFixedIncome,
      }: AccountWithIncludes = await request.json()
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
          id: { not: { equals: accountId } },
        },
      })
      if (exists !== null) {
        throw new BadRequestException("Account name is already used.")
      }

      // passed validation

      // if its an investment account - stick it to current tickerPrice
      let latestVooPrice: TickerPrice | null = null
      if (accountType === "Investment") {
        latestVooPrice = await getLatestTickerPrice("VOO")
      }

      // if its a traditional account - assume all fixed income is FBND and stick it to current price
      let latestFbndPrice: TickerPrice | null = null
      if (accountBucket === "Traditional") {
        latestFbndPrice = await getLatestTickerPrice("FBND")
      }

      const updatedAccount = await prisma.account.update({
        data: {
          name,
          accountType,
          accountBucket,
          balance,
          creditCardType,
          totalFixedIncome,
          tickerPrice: latestVooPrice ? latestVooPrice.price : null,
          fixedIncomeTickerPrice: latestFbndPrice
            ? latestFbndPrice.price
            : null,
        },
        where: { id: accountId },
      })

      carryOver.forEach(async ({ id, ...co }) => {
        const exists = await prisma.carryOver.findUnique({
          where: { accountId_date: { accountId, date: co.date } },
        })
        if (exists !== null) {
          await prisma.carryOver.update({
            data: {
              amount: co.amount,
            },
            where: { id: exists.id },
          })
        } else {
          await prisma.carryOver.create({
            data: {
              ...co,
            },
          })
        }
      })

      // refetch with includes
      return await prisma.account.findUnique({
        where: {
          id: accountId,
        },
        include: { carryOver: true },
      })
    })
  },
  DELETE: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const accountId = Number(params.accountId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )
      await prisma.carryOver.deleteMany({ where: { accountId } })
      await prisma.account.delete({
        where: { id: accountId },
        include: { payments: true },
      })
    })
  },

    }
  }
})
