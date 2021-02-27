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
