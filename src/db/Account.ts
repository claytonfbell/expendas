import mongoose, { Document, Schema } from "mongoose"
import { HouseholdDocument } from "./Household"

export type AccountType =
  | "Cash"
  | "Credit Card"
  | "Checking Account"
  | "Savings Account"
  | "CD"
  | "CD IRA"
  | "Line of Credit"

export type CreditCardType =
  | "Mastercard"
  | "Visa"
  | "American Express"
  | "Discover"

export interface IAccount {
  _id?: string
  household?: HouseholdDocument["_id"]
  type: AccountType
  name: string
  creditCardType: CreditCardType | null
  currentBalance: number
}

export type AccountDocument = IAccount & Document

export const AccountSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  type: { type: Schema.Types.String, required: true, index: true },
  name: { type: Schema.Types.String, required: true },
  creditCardType: { type: Schema.Types.String },
  currentBalance: { type: Schema.Types.Number, required: true },
})

module.exports =
  mongoose.models.Accounts ||
  mongoose.model<AccountDocument>("Accounts", AccountSchema)
export default module.exports as mongoose.Model<AccountDocument, {}>
