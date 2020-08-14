import sgMail from "@sendgrid/mail"
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
import { ForgotPasswordRequest } from "../../src/model/ForgotPasswordRequest"
import randomString from "../../src/util/randomString"
import validate from "../../src/util/validate"

export default async (
  req: NextApiRequestApplied,
  res: NextApiResponseApplied
) => {
  await applyMiddleware(req, res)
  await res.build(async () => {
    switch (req.method) {
      case "POST":
        const { email }: ForgotPasswordRequest = req.body

        validate({ email }).email()

        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists === null) {
          throw new BadRequestException(
            `There is no account registerd with email **${email}**.`
          )
        }

        // send reset email here
        exists.passwordResetCode = randomString(16)
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
