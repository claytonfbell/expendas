import { Account, CarryOver } from "@prisma/client"

export type AccountWithIncludes = Account & {
  carryOver: CarryOver[]
}
