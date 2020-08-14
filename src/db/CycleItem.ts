import mongoose, { Document, Schema } from "mongoose"
import { HouseholdDocument } from "./Household"
import { IPaymentPopulated, PaymentDocument } from "./Payment"

export interface ICycleItem {
  _id?: string
  household: HouseholdDocument["_id"]
  payment: PaymentDocument["_id"]
  date: string
  amount: number
  isPaid: boolean
}

export type ICycleItemPopulated = ICycleItem & {
  payment: IPaymentPopulated
}

export type CycleItemDocument = ICycleItem & Document

export const CycleItemSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  payment: { type: Schema.Types.ObjectId, ref: "Payments", index: true },
  date: { type: Schema.Types.String, required: true, index: true },
  amount: { type: Schema.Types.Number, required: true },
  isPaid: { type: Schema.Types.Boolean },
})

module.exports =
  mongoose.models.CycleItems ||
  mongoose.model<CycleItemDocument>("CycleItems", CycleItemSchema)
export default module.exports as mongoose.Model<CycleItemDocument, {}>
