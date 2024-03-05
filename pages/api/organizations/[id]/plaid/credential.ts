import { NextApiResponse } from "next"
import { PlaidLinkOnSuccessMetadata } from "react-plaid-link"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import {
  PLAID_ENVIRONMENT,
  getPlaidClient,
} from "../../../../../lib/server/getPlaidClient"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

type AddPlaidCredential = {
  public_token: string
  metadata: PlaidLinkOnSuccessMetadata
}

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

    if (req.method === "POST") {
      let { public_token, metadata }: AddPlaidCredential = req.body

      /**
       * Call /item/public_token/exchange to exchange the public_token for a
       * permanent access_token and item_id for the new Item.
       */
      const plaidClient = getPlaidClient()
      const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      })

      // check if plaid credential already exists for this organization
      const exists = await prisma.plaidCredential.findFirst({
        where: {
          plaidItemId: exchangeTokenResponse.data.item_id,
          organizationId,
          plaidEnvironment: PLAID_ENVIRONMENT,
        },
      })
      if (exists) {
        // update existing plaid credential
        await prisma.plaidCredential.update({
          where: { id: exists.id },
          data: {
            accessToken: exchangeTokenResponse.data.access_token,
            plaidRequestId: exchangeTokenResponse.data.request_id,
            metadata: JSON.stringify(metadata),
          },
        })
      } else {
        // create new plaid credential
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
    }
  })
}

export default withSession(handler)
