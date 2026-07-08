import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { autoUpdateInvestmentAccountBalances } from "../../components/server/autoUpdateInvestmentAccountBalances"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import { updateAccountBalanceHistory } from "../../components/server/updateAccountBalanceHistory"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/$id/accounts/auto-update-balances")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          await requireOrganizationAuthentication(session, prisma, organizationId)
          await autoUpdateInvestmentAccountBalances()
          await updateAccountBalanceHistory(organizationId)
          return { success: true }
        })
      },
    }
  }
})