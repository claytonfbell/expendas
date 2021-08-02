import { AccountType } from "@prisma/client"
import { OptionType } from "material-ui-pack"

export const accountTypes: AccountType[] = [
  "CD",
  "Car_Value",
  "Cash",
  "Checking_Account",
  "Credit_Card",
  "Home_Market_Value",
  "Investment",
  "Line_of_Credit",
  "Loan",
  "Savings_Account",
]

export const displayAccountType = (accountType: AccountType) =>
  accountType.replace(/_/g, " ")

export const accountTypeOptions: OptionType[] = accountTypes.map((value) => ({
  value,
  label: displayAccountType(value),
}))
