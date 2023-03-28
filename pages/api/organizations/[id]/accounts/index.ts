import { Account } from "@prisma/client"
import { NextApiResponse } from "next"
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
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )
    // GET
    if (req.method === "GET") {
      const accounts = await prisma.account.findMany({
        where: {
          organizationId,
        },
        include: { carryOver: true },
        orderBy: { name: "asc" },
      })

      return accounts
    }
    // POST
    else if (req.method === "POST") {
      const {
        name,
        accountType,
        balance,
        creditCardType,
        accountBucket,
      }: Account = req.body
      validate({ name }).notEmpty()
      validate({ accountType }).notEmpty()
      validate({ accountBucket }).notEmpty()
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
    }
  })
}

export default withSession(handler)
