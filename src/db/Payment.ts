import mongoose, { Document, Schema } from "mongoose"
import { AccountDocument, IAccount } from "./Account"
import { HouseholdDocument } from "./Household"

export type MonthOfYear = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
export type DayOfMonth =
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

export interface IPayment {
  _id?: string
  household?: HouseholdDocument["_id"]
  account: AccountDocument["_id"]
  amount: number
  paidTo: string
  date: string
  repeatsUntilDate: string | null
  repeatsOnDaysOfMonth: DayOfMonth[] | null
  repeatsOnMonthsOfYear: MonthOfYear[] | null
  repeatsWeekly: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | null
}

export type IPaymentPopulated = IPayment & {
  account: IAccount
}

export type PaymentDocument = IPayment & Document

export const PaymentSchema: Schema = new Schema({
  household: { type: Schema.Types.ObjectId, ref: "Households", index: true },
  account: { type: Schema.Types.ObjectId, ref: "Accounts", index: true },
  amount: { type: "number", required: true, unique: false, index: false },
  paidTo: { type: Schema.Types.String, required: true },
  date: { type: Schema.Types.String, required: true },
  repeatsUntilDate: { type: Schema.Types.String },
  repeatsOnDaysOfMonth: [{ type: Schema.Types.Number }],
  repeatsOnMonthsOfYear: [{ type: Schema.Types.Number }],
  repeatsWeekly: { type: Schema.Types.Number },
})

module.exports =
  mongoose.models.Payments ||
  mongoose.model<PaymentDocument>("Payments", PaymentSchema)
export default module.exports as mongoose.Model<PaymentDocument, {}>
