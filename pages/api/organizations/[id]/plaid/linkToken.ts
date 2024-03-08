import { NextApiResponse } from "next"
import { CountryCode, Products } from "plaid"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import { getPlaidClient } from "../../../../../lib/server/getPlaidClient"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

export type LinkTokenRequest = {
  products?: Products[]
}

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const { products } = req.body as LinkTokenRequest
    if (products === undefined || products.length === 0) {
      throw new Error("Must select at least one product to link.")
    }

    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )

    if (req.method === "POST") {
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
        // link-sandbox-1548c049-df2d-4c21-b663-2635d0732ccf
        const link_token = (await result).data.link_token
        return { link_token }
      } else {
        throw new Error("Failed to create link token")
      }
    }
  })
}

export default withSession(handler)
