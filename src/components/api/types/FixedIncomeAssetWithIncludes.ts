import { Account, FixedIncomeAsset } from "@prisma/client"

export type FixedIncomeAssetWithIncludesData = FixedIncomeAsset & {
  account: Account
}
