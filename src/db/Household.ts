import mongoose, { Document, Schema } from "mongoose"
import { UserDocument } from "./User"

export interface IHousehold {
  _id?: string
  name: string
  members: [UserDocument["_id"]]
}

export type HouseholdDocument = IHousehold & Document

const HouseholdSchema: Schema = new Schema({
  name: { type: "string", required: true, unique: false, index: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
})

module.exports =
  mongoose.models.Household ||
  mongoose.model<HouseholdDocument>("Household", HouseholdSchema)
export default module.exports as mongoose.Model<HouseholdDocument, {}>
