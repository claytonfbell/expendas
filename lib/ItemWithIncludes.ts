import { Account, Item, Payment } from "@prisma/client"

export type ItemWithIncludes = Item & {
  payment: Payment & {
    account: Account
  }
}
