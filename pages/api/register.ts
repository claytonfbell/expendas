import mongoose from "mongoose"
import { NextApiRequest, NextApiResponse } from "next"
import isEmail from "validator/lib/isEmail"
import buildResponse from "../../src/exceptions/buildResponse"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../src/exceptions/HttpException"
import { RegisterRequest } from "../../src/model/RegisterRequest"
import User from "../../src/model/User"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  buildResponse(res, async () => {
    await mongoose.connect(process.env.mongodb, {
      useNewUrlParser: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    })

    switch (req.method) {
      case "POST":
        const {
          firstName,
          lastName,
          email,
          newPassword,
        }: RegisterRequest = req.body

        if (firstName.length < 1) {
          throw new BadRequestException(
            `Field **First Name** does not look valid.`
          )
        }
        if (lastName.length < 1) {
          throw new BadRequestException(
            `Field **Last Name** does not look valid.`
          )
        }
        if (email.length < 1) {
          throw new BadRequestException(`Field **Email** does not look valid.`)
        }
        if (!isEmail(email)) {
          throw new BadRequestException(
            `Email address **${email}** does not look valid.`
          )
        }
        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists !== null) {
          throw new BadRequestException(
            `It looks like there is already an account registered with the email **${email}**`
          )
        }

        const user = await User.create({
          firstName,
          lastName,
          email: email.toLowerCase(),
          passwordHash: "xxxxxx",
        })

        mongoose.disconnect()

        return user
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
