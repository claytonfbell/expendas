import { AccountBucket } from "@prisma/client"
import { OptionType } from "material-ui-pack"

export const accountBuckets: AccountBucket[] = [
  "After_Tax",
  "Traditional",
  "Roth_And_HSA",
]

export const displayAccountBucket = (accountBucket: AccountBucket) =>
  accountBucket.replace(/_/g, " ")

export const accountBucketOptions: OptionType[] = accountBuckets.map(
  (value) => ({
    value,
    label: displayAccountBucket(value),
  })
)
