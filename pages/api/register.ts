import bcrypt from "bcrypt"
import mongoose from "mongoose"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../src/middleware/applyMiddleware"
import { RegisterRequest } from "../../src/model/RegisterRequest"
import User from "../../src/model/User"
import validate from "../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "POST":
        const {
          firstName,
          lastName,
          email,
          newPassword,
        }: RegisterRequest = req.body

        validate({ firstName }).min(1)
        validate({ lastName }).min(1)
        validate({ email }).email()

        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists !== null) {
          throw new BadRequestException(
            `It looks like there is already an account registered with the email **${email}**`
          )
        }

        validate({ newPassword }).strongPassword()

        const user = await User.create({
          firstName,
          lastName,
          email: email.toLowerCase(),
          passwordHash: bcrypt.hashSync(newPassword, 10),
          timeZone: "America/Los_Angeles",
        })

        mongoose.disconnect()

        return user
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
