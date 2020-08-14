import { AccountType, CreditCardType } from "../db/Account"

export interface AccountRequest {
  type: AccountType
  name: string
  creditCardType: CreditCardType | null
  currentBalance: number
}
