import mongoose, { Document, Schema } from "mongoose"
import { IHousehold } from "./Household"

export type PaymentMethodType = "Credit Card" | "Check" | "Cash" | "Paycheck"

export interface IPaymentMethod extends Document {
  household: IHousehold["_id"]
  type: PaymentMethodType
  name: string
  creditCardType: "Mastercard" | "Visa" | "American Express" | "Discover" | null
}

export const PaymentMethodSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  type: { type: Schema.Types.String, required: true, index: true },
  name: { type: Schema.Types.String, required: true },
  creditCardType: { type: Schema.Types.String },
})

module.exports =
  mongoose.models.PaymentMethods ||
  mongoose.model<IPaymentMethod>("PaymentMethods", PaymentMethodSchema)
export default module.exports as mongoose.Model<IPaymentMethod, {}>
