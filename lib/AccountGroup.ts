import { AccountType, CreditCardType } from "@prisma/client"

export const loanAccountTypes: AccountType[] = ["Loan"]

export const savingsInvestmentsAccountTypes: AccountType[] = [
  "CD",
  "Savings_Account",
  "Investment",
]

export const assetsAccountTypes: AccountType[] = [
  "Home_Market_Value",
  "Car_Value",
]

export const dailyAccountTypes: AccountType[] = [
  "Cash",
  "Credit_Card",
  "Checking_Account",
  "Line_of_Credit",
]

export const allAccountTypes: AccountType[] = [
  ...loanAccountTypes,
  ...savingsInvestmentsAccountTypes,
  ...assetsAccountTypes,
  ...dailyAccountTypes,
]

export const creditCardTypes: CreditCardType[] = [
  "American_Express",
  "Discover",
  "Mastercard",
  "Visa",
]

export type AccountGroup = {
  label: string
  types: AccountType[]
}

export const cashGroup: AccountGroup = {
  label: "Cash",
  types: ["Cash", "Checking_Account", "Savings_Account"],
}
export const debtGroup: AccountGroup = {
  label: "Debt",
  types: ["Credit_Card", "Loan", "Line_of_Credit"],
}
export const investmentGroup: AccountGroup = {
  label: "Investments",
  types: ["CD", "Investment"],
}
export const propertyGroup: AccountGroup = {
  label: "Property",
  types: ["Home_Market_Value", "Car_Value"],
}

export const accountGroups: AccountGroup[] = [
  cashGroup,
  debtGroup,
  investmentGroup,
  propertyGroup,
]
