import { Account, Payment } from "@prisma/client"

export type PaymentWithIncludes = Payment & {
  account: Account
}
