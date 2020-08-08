import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
  email: string
  firstName: string
  lastName: string
  passwordHash: string
}

const UserSchema: Schema = new Schema({
  email: { type: "string", required: true, unique: true },
  firstName: { type: "string", required: true },
  lastName: { type: "string", required: true },
  passwordHash: { type: "string", required: true },
})

UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports =
  mongoose.models.Users || mongoose.model<IUser>("Users", UserSchema)
export default module.exports
