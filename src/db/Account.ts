import mongoose, { Document, Schema } from "mongoose"
import { HouseholdDocument } from "./Household"

export type AccountType =
  | "Cash"
  | "Credit Card"
  | "Checking Account"
  | "Savings Account"
  | "CD"
  | "Investment"
  | "Line of Credit"
  | "Loan"
  | "Home Market Value"
  | "Car Value"

export type CreditCardType =
  | "Apple Card"
  | "Mastercard"
  | "Visa"
  | "American Express"
  | "Discover"

export type CarryOverBalance = {
  balance: number
  date: string
}

export interface IAccount {
  _id?: string
  household?: HouseholdDocument["_id"]
  type: AccountType
  name: string
  creditCardType: CreditCardType | null
  currentBalance: number
  carryOver: CarryOverBalance[]
  sortBy: number
}

export type AccountDocument = IAccount & Document

export const CarryOverBalance: Schema = new Schema({
  balance: { type: Schema.Types.Number, required: true },
  date: { type: Schema.Types.String, required: true },
})

export const AccountSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  type: { type: Schema.Types.String, required: true, index: true },
  name: { type: Schema.Types.String, required: true },
  creditCardType: { type: Schema.Types.String },
  currentBalance: { type: Schema.Types.Number, required: true },
  carryOver: [CarryOverBalance],
  sortBy: { type: Schema.Types.Number, required: true },
})

module.exports =
  mongoose.models.Accounts ||
  mongoose.model<AccountDocument>("Accounts", AccountSchema)
export default module.exports as mongoose.Model<AccountDocument, {}>
