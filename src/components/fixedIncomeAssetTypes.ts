import { FixedIncomeAssetType } from "@prisma/client"

export const displayFixedIncomeAssetType = (
  fixedIncomeAssetType: FixedIncomeAssetType
) =>
  fixedIncomeAssetType === "US_Treasury_T_Bill"
    ? "U.S. Treasury"
    : fixedIncomeAssetType.replace(/_/g, " ")

export const allFixedIncomeAssetTypes: FixedIncomeAssetType[] = [
  "Bond_Fund",
  "CD",
  "Money_Market_Fund",
  "US_Treasury_T_Bill",
]
