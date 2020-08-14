import mongoose, { Document, Schema } from "mongoose"
import { IUser } from "../db/User"

export interface IHousehold extends Document {
  name: string
  members: [IUser["_id"]]
}

const HouseholdSchema: Schema = new Schema({
  name: { type: "string", required: true, unique: false, index: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
})

module.exports =
  mongoose.models.Household ||
  mongoose.model<IHousehold>("Household", HouseholdSchema)
export default module.exports as mongoose.Model<IHousehold, {}>
