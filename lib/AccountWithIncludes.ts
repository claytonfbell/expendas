import { Account, CarryOver } from "@prisma/client"

export type AccountWithIncludes = Account & {
  carryOver: CarryOver[]
  plaidCredential: { lastUpdated: string }
}

export type AccountWithBalanceHistory = Account & {
  balanceHistory: balanceHistory[]
}

type balanceHistory = {
  balance: number
  marketHigh: number | null
  marketLow: number | null
  fixedIncome: number
  date: string
}
