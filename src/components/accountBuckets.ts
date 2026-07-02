import { AccountBucket } from "@prisma/client"
import { OptionType } from "material-ui-pack"

export const accountBuckets: AccountBucket[] = [
  "After_Tax",
  "Traditional",
  "Roth_And_HSA",
]

export const displayAccountBucket = (accountBucket: AccountBucket) => {
  switch (accountBucket) {
    case "After_Tax":
      return "Taxable"
    case "Traditional":
      return "Tax Deferred"
    case "Roth_And_HSA":
      return "Tax Free"
  }
}

export const accountBucketOptions: OptionType[] = accountBuckets.map(
  (value) => ({
    value,
    label: displayAccountBucket(value),
  })
)
