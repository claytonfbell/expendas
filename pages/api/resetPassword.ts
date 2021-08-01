// pages/api/login.ts
import { SHA3 } from "crypto-js"
import moment from "moment"
import { NextApiRequest, NextApiResponse } from "next"
import { ResetPasswordRequest } from "../../lib/api/ResetPasswordRequest"
import { ResetPasswordResponse } from "../../lib/api/ResetPasswordResponse"
import { buildResponse } from "../../lib/server/buildResponse"
import { BadRequestException } from "../../lib/server/HttpException"
import prisma from "../../lib/server/prisma"
import validate from "../../lib/server/validate"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "POST") {
      let { password = "", authCode = "" }: ResetPasswordRequest = req.body

      validate({ password }).strongPassword()

      // check if email is already used
      let user = await prisma.user.findFirst({
        where: {
          authCode: { equals: authCode },
        },
      })
      if (user === null) {
        throw new BadRequestException("Reset code is not valid.")
      }
      if (
        user.authCodeExpiresAt === null ||
        user.authCodeExpiresAt < moment().toDate()
      ) {
        throw new BadRequestException("Reset code expired.")
      }

      // validation passed
      // send user an auth code
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          authCode: null,
          authCodeExpiresAt: null,
          passwordHash: SHA3(password).toString(),
        },
      })

      const response: ResetPasswordResponse = {
        message: "Your new password has been saved.",
      }
      return response
    }
  })
}

export default handler
