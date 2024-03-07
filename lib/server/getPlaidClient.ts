import { PlaidEnvironment } from "@prisma/client"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

export const PLAID_ENVIRONMENT: PlaidEnvironment = PlaidEnvironment.Production

export function getPlaidClient() {
  const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENVIRONMENT.toLowerCase()],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET":
          PLAID_ENVIRONMENT === PlaidEnvironment.Sandbox
            ? process.env.PLAID_SECRET_SANDBOX
            : PLAID_ENVIRONMENT === PlaidEnvironment.Development
            ? process.env.PLAID_SECRET_DEVELOPMENT
            : process.env.PLAID_SECRET_PRODUCTION,
      },
    },
  })

  return new PlaidApi(configuration)
}
