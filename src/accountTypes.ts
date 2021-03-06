import { AccountType, CreditCardType } from "./db/Account"

export const loanAccountTypes: AccountType[] = ["Loan"]

export const savingsInvestmentsAccountTypes: AccountType[] = [
  "CD",
  "Savings Account",
  "Investment",
]

export const assetsAccountTypes: AccountType[] = [
  "Home Market Value",
  "Car Value",
]

export const dailyAccountTypes: AccountType[] = [
  "Cash",
  "Credit Card",
  "Checking Account",
  "Line of Credit",
]

export const allAccountTypes: AccountType[] = [
  ...loanAccountTypes,
  ...savingsInvestmentsAccountTypes,
  ...assetsAccountTypes,
  ...dailyAccountTypes,
]

export const creditCardTypes: CreditCardType[] = [
  "American Express",
  "Apple Card",
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
  types: ["Cash", "Checking Account", "Savings Account"],
}
export const debtGroup: AccountGroup = {
  label: "Debt",
  types: ["Credit Card", "Loan", "Line of Credit"],
}
export const investmentGroup: AccountGroup = {
  label: "Investments",
  types: ["CD", "Investment"],
}
export const propertyGroup: AccountGroup = {
  label: "Property",
  types: ["Home Market Value", "Car Value"],
}

export const accountGroups: AccountGroup[] = [
  cashGroup,
  debtGroup,
  investmentGroup,
  propertyGroup,
]
