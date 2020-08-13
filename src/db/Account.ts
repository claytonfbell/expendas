import mongoose, { Document, Schema } from "mongoose"
import { IHousehold } from "../model/Household"

export type AccountType = "Credit Card" | "Checking Account" | "Cash"

export interface IAccount extends Document {
  household: IHousehold["_id"]
  type: AccountType
  name: string
  creditCardType: "Mastercard" | "Visa" | "American Express" | "Discover" | null
  currentBalance: number
}

export const AccountSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  type: { type: Schema.Types.String, required: true, index: true },
  name: { type: Schema.Types.String, required: true },
  creditCardType: { type: Schema.Types.String },
  currentBalance: { type: Schema.Types.Number, required: true },
})

module.exports =
  mongoose.models.Accounts ||
  mongoose.model<IAccount>("Accounts", AccountSchema)
export default module.exports as mongoose.Model<IAccount, {}>
