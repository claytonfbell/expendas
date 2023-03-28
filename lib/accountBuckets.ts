import { AccountBucket } from "@prisma/client"
import { OptionType } from "material-ui-pack"

const accountBuckets: AccountBucket[] = [
  "Roth_And_HSA",
  "Traditional",
  "After_Tax",
]

export const displayAccountBucket = (accountBucket: AccountBucket) =>
  accountBucket.replace(/_/g, " ")

export const accountBucketOptions: OptionType[] = accountBuckets.map(
  (value) => ({
    value,
    label: displayAccountBucket(value),
  })
)
