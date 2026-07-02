import { createFileRoute } from "@tanstack/react-router"
import { CountryCode, Products } from "plaid"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { getPlaidClient } from "../../../lib/server/getPlaidClient"
import prisma from "../../../lib/server/prisma"

export type LinkTokenRequest = {
  products?: Products[]
}

export const Route = createFileRoute(
  "/api/organizations/$id/plaid/linkToken"
)({
  server: {
    handlers: {  
    POST: async ({ request, params }) => {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const body = await request.json()
        const { products } = body as LinkTokenRequest
        if (products === undefined || products.length === 0) {
          throw new Error("Must select at least one product to link.")
        }
  
        const user = await requireOrganizationAuthentication(
          session,
          prisma,
          organizationId
        )
  
        const plaidClient = getPlaidClient()
        console.log("Creating link token")
        const result = await plaidClient.linkTokenCreate({
          client_name: "Expendas",
          user: {
            client_user_id: `${user.id}`,
            email_address: user.email,
          },
          language: "en",
          country_codes: [CountryCode.Us],
          products,
        })
  
        if (result.status === 200) {
          const link_token = (await result).data.link_token
          return { link_token }
        } else {
          throw new Error("Failed to create link token")
        }
      })
    },
  
    }
  }
})
