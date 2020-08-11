import mongoose, { Document, Schema } from "mongoose"
import { IHousehold } from "./Household"
import { IPayment } from "./Payment"

export interface ICycleItem extends Document {
  household: IHousehold["_id"]
  payment: IPayment["_id"]
  date: Date
  amount: number
  isPaid: boolean
}

export const CycleItemSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households" },
  payment: { type: Schema.Types.ObjectId, ref: "Payments", index: true },
  date: { type: Schema.Types.Date, required: true, index: true },
  amount: { type: Schema.Types.Number, required: true },
  isPaid: { type: Schema.Types.Boolean },
})

module.exports =
  mongoose.models.CycleItems ||
  mongoose.model<ICycleItem>("CycleItems", CycleItemSchema)
export default module.exports as mongoose.Model<ICycleItem, {}>
