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
      const { name, accountType, balance, creditCardType }: Account = req.body
      validate({ name }).notEmpty()
      validate({ accountType }).notEmpty()
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
          balance,
          creditCardType,
        },
        where: { id: accountId },
      })

      return account
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.account.delete({
        where: { id: accountId },
        include: { payments: true },
      })
    }
  })
}

export default withSession(handler)
