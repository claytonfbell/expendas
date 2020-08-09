import mongoose, { Document, Schema } from "mongoose"
import { IHousehold } from "./Household"
import { IPaymentMethod } from "./PaymentMethod"

type MonthOfYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6
type DayOfMonth =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
type Weekly = 1
type BiWeekly = 2

export interface IPayment extends Document {
  household: IHousehold["_id"]
  method: IPaymentMethod["_id"]
  amount: number
  paidTo: string
  when: Date
  repeatsUntil: Date | null
  repeatsOnDaysOfMonth: DayOfMonth[] | null
  repeatsOnMonthsOfYear: MonthOfYear[] | null
  repeatsWeekly: Weekly | BiWeekly | null
  repeatsDayOfWeek: DayOfWeek | null
}

export const PaymentSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households", index: true },
  method: { type: Schema.Types.ObjectId, ref: "PaymentMethods", index: true },
  amount: { type: "number", required: true, unique: false, index: false },
  paidTo: { type: Schema.Types.String, required: true },
  when: { type: Schema.Types.Date },
  repeatsUntil: { type: Schema.Types.Date },
  repeatsOnDaysOfMonth: [{ type: Schema.Types.Number }],
  repeatsOnMonthsOfYear: [{ type: Schema.Types.Number }],
  repeatsWeekly: { type: Schema.Types.Number },
  repeatsDayOfWeek: { type: Schema.Types.Number },
})

module.exports =
  mongoose.models.Payments ||
  mongoose.model<IPayment>("Payments", PaymentSchema)
export default module.exports as mongoose.Model<IPayment, {}>
