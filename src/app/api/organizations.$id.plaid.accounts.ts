import { AccountType, PlaidCredential } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import {
  PLAID_ENVIRONMENT,
  getPlaidClient,
} from "../../components/server/getPlaidClient"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute(
  "/api/organizations/$id/plaid/accounts"
)({
  server: {
    handlers: {  
    POST: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        console.log("Processing plaid accounts")
        const organizationId = Number(params.id)
  
        const user = await requireOrganizationAuthentication(
          session,
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
      })
    },
  
    }
  }
})

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
      if (existingAccount) {
        console.log("Updating existing account")
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: {
            balance: dollarsToCents(account.balances.current?.valueOf() || 0),
          },
        })
      } else {
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

      await prisma.plaidCredential.update({
        where: { id: plaidCredential.id },
        data: {
          lastUpdated: new Date(),
        },
      })
    }
  }
}
