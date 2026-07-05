import { Account, Asset, CarryOver } from "@prisma/client"

export type AccountWithIncludes = Account & {
  carryOver: CarryOver[]
  plaidCredential: { lastUpdated: string }
  assets: Asset[]
}

export type AccountWithBalanceHistory = Account & {
  balanceHistory: balanceHistory[]
}

type balanceHistory = {
  balance: number
  marketHigh: number | null
  marketLow: number | null
  date: string
}