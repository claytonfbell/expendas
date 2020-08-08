import sgMail from "@sendgrid/mail"
import mongoose from "mongoose"
import { NextApiRequest, NextApiResponse } from "next"
import isEmail from "validator/lib/isEmail"
import buildResponse from "../../src/exceptions/buildResponse"
import {
  BadRequestException,
  MethodNotAllowedException,
} from "../../src/exceptions/HttpException"
import { ForgotPasswordRequest } from "../../src/model/ForgotPasswordRequest"
import User from "../../src/model/User"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await buildResponse(res, async () => {
    await mongoose.connect(process.env.mongodb, {
      useNewUrlParser: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    })

    switch (req.method) {
      case "POST":
        const { email }: ForgotPasswordRequest = req.body

        if (email.length < 1) {
          throw new BadRequestException(`Field **Email** does not look valid.`)
        }
        if (!isEmail(email)) {
          throw new BadRequestException(
            `Email address **${email}** does not look valid.`
          )
        }
        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists === null) {
          throw new BadRequestException(
            `There is no account registerd with email **${email}**.`
          )
        }

        // send reset email here
        sgMail.setApiKey(process.env.sendgrid_api_key)
        const msg = {
          to: "claytonfbell@gmail.com",
          from: "noreply@expendas.com", // Use the email address or domain you verified above
          subject: "Sending with Twilio SendGrid is Fun",
          text: "and easy to do anywhere, even with Node.js",
          html: "<strong>and easy to do anywhere, even with Node.js</strong>",
        }
        await sgMail.send(msg)

        mongoose.disconnect()

        return
        break
      default:
        throw new MethodNotAllowedException()
    }
  })
}
