import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  email: string
  firstName: string
  lastName: string
  passwordHash: string
  passwordResetCode?: string
  timeZone: string
}

export const UserSchema: Schema = new Schema({
  email: { type: "string", required: true, unique: true, index: true },
  firstName: { type: "string", required: true },
  lastName: { type: "string", required: true },
  passwordHash: { type: "string", required: true },
  passwordResetCode: { type: "string", index: true },
  timeZone: { type: "string", required: true },
})

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports =
  mongoose.models.Users || mongoose.model<IUser>("Users", UserSchema)
export default module.exports as mongoose.Model<IUser, {}>
