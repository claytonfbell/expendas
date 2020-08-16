import { AccountType } from "./db/Account"

export const loanAccountTypes: AccountType[] = ["Car Loan", "Home Mortgage"]

export const savingsAccountTypes: AccountType[] = [
  "CD",
  "CD IRA",
  "Savings Account",
]

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
