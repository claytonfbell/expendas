import { AccountType, CreditCardType } from "./db/Account"

export const loanAccountTypes: AccountType[] = ["Loan"]

export const savingsAccountTypes: AccountType[] = ["CD", "Savings Account"]

export const assetsAccountTypes: AccountType[] = ["Home Market Value"]

export const dailyAccountTypes: AccountType[] = [
  "Cash",
  "Credit Card",
  "Checking Account",
  "Line of Credit",
]

export const allAccountTypes: AccountType[] = [
  ...loanAccountTypes,
  ...savingsAccountTypes,
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
