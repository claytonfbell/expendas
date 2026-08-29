import { Account, Asset, AssetTicker, CarryOver } from "@prisma/client"

export type AssetWithTicker = Asset & { assetTicker: AssetTicker }

export type AccountWithIncludes = Account & {
  carryOver: CarryOver[]
  plaidCredential: { lastUpdated: string }
  assets: AssetWithTicker[]
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
