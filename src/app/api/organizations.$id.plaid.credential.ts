import { createFileRoute } from "@tanstack/react-router"
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import {
  PLAID_ENVIRONMENT,
  getPlaidClient,
} from "../../components/server/getPlaidClient"
import prisma from "../../components/server/prisma"

type AddPlaidCredential = {
  public_token: string
  metadata: PlaidLinkOnSuccessMetadata
}

export const Route = createFileRoute("/api/organizations/$id/plaid/credential")(
  {
    server: {
      handlers: {
        POST: async ({ request, params }) => {
          return buildResponse(request, async (session) => {
            const organizationId = Number(params.id)
            const user = await requireOrganizationAuthentication(
              session,
              prisma,
              organizationId
            )

            const body = await request.json()
            let { public_token, metadata }: AddPlaidCredential = body

            const plaidClient = getPlaidClient()
            const exchangeTokenResponse =
              await plaidClient.itemPublicTokenExchange({
                public_token: public_token,
              })

            const exists = await prisma.plaidCredential.findFirst({
              where: {
                plaidItemId: exchangeTokenResponse.data.item_id,
                organizationId,
                plaidEnvironment: PLAID_ENVIRONMENT,
              },
            })
            if (exists) {
              await prisma.plaidCredential.update({
                where: { id: exists.id },
                data: {
                  accessToken: exchangeTokenResponse.data.access_token,
                  plaidRequestId: exchangeTokenResponse.data.request_id,
                  metadata: JSON.stringify(metadata),
                },
              })
            } else {
              await prisma.plaidCredential.create({
                data: {
                  organizationId,
                  plaidEnvironment: PLAID_ENVIRONMENT,
                  accessToken: exchangeTokenResponse.data.access_token,
                  plaidItemId: exchangeTokenResponse.data.item_id,
                  plaidRequestId: exchangeTokenResponse.data.request_id,
                  metadata: JSON.stringify(metadata),
                  lastUpdated: null,
                },
              })
            }
            return { success: true }
          })
        },
      },
    },
  }
)
