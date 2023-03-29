import { NextApiResponse } from "next"
import { AccountWithIncludes } from "../../../../../lib/AccountWithIncludes"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import { BadRequestException } from "../../../../../lib/server/HttpException"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import validate from "../../../../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const accountId = Number(req.query.accountId)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    const account = await prisma.account.findUnique({
      where: {
        id: accountId,
      },
    })
    validate({ account }).notNull()

    // GET
    if (req.method === "GET") {
      return account
    }
    // PUT
    else if (req.method === "PUT") {
      const {
        name,
        accountType,
        accountBucket,
        balance,
        creditCardType,
        carryOver,
        totalDeposits,
        totalFixedIncome,
      }: AccountWithIncludes = req.body
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
      const account = await prisma.account.update({
        data: {
          name,
          accountType,
          accountBucket,
          balance,
          creditCardType,
          totalDeposits,
          totalFixedIncome,
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
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.carryOver.deleteMany({ where: { accountId } })
      await prisma.account.delete({
        where: { id: accountId },
        include: { payments: true },
      })
    }
  })
}

export default withSession(handler)
