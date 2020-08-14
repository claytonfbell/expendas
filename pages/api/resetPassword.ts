import sgMail from "@sendgrid/mail"
import bcrypt from "bcrypt"
import marked from "marked"
import mongoose from "mongoose"
import User from "../../src/db/User"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../src/exceptions/HttpException"
import applyMiddleware, {
  NextApiRequestApplied,
  NextApiResponseApplied,
} from "../../src/middleware/applyMiddleware"
import { ResetPasswordRequest } from "../../src/model/ResetPasswordRequest"
import validate from "../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  res.build(async () => {
    switch (req.method) {
      case "POST":
        const { newPassword, code }: ResetPasswordRequest = req.body

        validate({ newPassword }).strongPassword()
        validate({ code }).min(1)

        const exists = await User.findOne({ passwordResetCode: code })
        if (exists === null) {
          throw new BadRequestException(`Reset code is not valid.`)
        }

        // set new password
        exists.passwordHash = bcrypt.hashSync(newPassword, 10)
        exists.passwordResetCode = ""
        await exists.save()

        const host =
          process.env.NODE_ENV === "production"
            ? `https://expendas.com`
            : `http://localhost:3000`
        const url = `${host}/resetPassword?code=${exists.passwordResetCode}`
        const text = `[Click here](${url}) to setup a **new password**.`
        const msg = {
          to: exists.email,
          from: "noreply@expendas.com",
          subject: "Password Setup Code",
          text,
          html: marked(text),
        }
        sgMail.setApiKey(process.env.sendgrid_api_key)
        await sgMail.send(msg)

        mongoose.disconnect()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
