// pages/api/login.ts
import moment from "moment"
import { NextApiRequest, NextApiResponse } from "next"
import { v4 as uuidv4 } from "uuid"
import { ForgotPasswordRequest } from "../../lib/api/ForgotPasswordRequest"
import { ForgotPasswordResponse } from "../../lib/api/ForgotPasswordResponse"
import { buildResponse } from "../../lib/server/buildResponse"
import { BadRequestException } from "../../lib/server/HttpException"
import prisma from "../../lib/server/prisma"
import { sendEmail } from "../../lib/server/sendEmail"
import validate from "../../lib/server/validate"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "POST") {
      let { email = "" }: ForgotPasswordRequest = req.body
      email = email.toLowerCase()

      validate({ email }).email()

      // check if email is already used
      let user = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (user === null) {
        throw new BadRequestException("User not found with email.")
      }

      // validation passed
      // send user an auth code
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          authCode: uuidv4(),
          authCodeExpiresAt: moment().add(10, "minutes").toDate(),
        },
      })

      // send email
      const text = `Use this link to setup a new password, code expires in **10 minutes**. \n\nhttps://expendas.com/setPassword?authCode=${user.authCode}.`
      sendEmail({ to: user.email, subject: "Password Reset Code", text })
        .then(() => {
          console.log("Email sent")
        })
        .catch((error) => {
          console.error(error)
        })

      const response: ForgotPasswordResponse = {
        message: "Check your email for a link to reset your password.",
      }
      return response
    }
  })
}

export default handler
