import { CreditCardType } from "@prisma/client"
import { OptionType } from "material-ui-pack"

const creditCardTypes: CreditCardType[] = [
  "American_Express",
  "Discover",
  "Mastercard",
  "Visa",
]

export const displayCreditCardType = (creditCardType: CreditCardType) =>
  creditCardType.replace(/_/g, " ")

export const creditCardTypeOptions: OptionType[] = creditCardTypes.map(
  (value) => ({
    value,
    label: displayCreditCardType(value),
  })
)
