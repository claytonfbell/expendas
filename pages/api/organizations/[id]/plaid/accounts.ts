import { AccountType, PlaidCredential } from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import {
  PLAID_ENVIRONMENT,
  getPlaidClient,
} from "../../../../../lib/server/getPlaidClient"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "POST") {
      console.log("Processing plaid accounts")
      const organizationId = Number(req.query.id)

      const user = await requireOrganizationAuthentication(
        req,
        prisma,
        organizationId
      )

      const old = Date.now() - 1000 * 60 * 60 * 6
      const plaidCredentials = await prisma.plaidCredential.findMany({
        where: {
          plaidEnvironment: PLAID_ENVIRONMENT,
          organizationId,
          OR: [
            {
              lastUpdated: null,
            },
            {
              lastUpdated: {
                lt: new Date(old),
              },
            },
          ],
        },
        include: {
          accounts: true,
        },
      })

      for (const plaidCredential of plaidCredentials) {
        await fetchAccounts(plaidCredential)
      }

      return { success: true }
    }
  })
}

export default withSession(handler)

const dollarsToCents = (dollars: number) => Math.round(dollars * 100)

async function fetchAccounts(plaidCredential: PlaidCredential) {
  const plaidClient = getPlaidClient()
  const result = await plaidClient.accountsBalanceGet({
    access_token: plaidCredential.accessToken,
  })
  if (result.status === 200) {
    for (const account of result.data.accounts) {
      const existingAccount = await prisma.account.findFirst({
        where: {
          organizationId: plaidCredential.organizationId,
          plaidAccountId: account.account_id,
          plaidCredentialId: plaidCredential.id,
        },
      })
      // update existing account balance
      if (existingAccount) {
        console.log("Updating existing account")
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            name: account.name,
            balance: dollarsToCents(account.balances.current?.valueOf() || 0),
            accountType: AccountType.Checking_Account,
          },
        })
      }
      // create new account
      else {
        console.log("Creating new account")
        await prisma.account.create({
          data: {
            organizationId: plaidCredential.organizationId,
            plaidAccountId: account.account_id,
            plaidCredentialId: plaidCredential.id,
            name: account.name,
            accountType: AccountType.Checking_Account,
            balance: dollarsToCents(account.balances.current?.valueOf() || 0),
          },
        })
      }

      // update lastUpdated on plaidCredential
      await prisma.plaidCredential.update({
        where: { id: plaidCredential.id },
        data: {
          lastUpdated: new Date(),
        },
      })
    }
  }
}
