import CryptoJS from "crypto-js"
const { SHA3 } = CryptoJS
import dayjs from "../../../lib/dayjs"
import { ResetPasswordRequest } from "../../../lib/api/ResetPasswordRequest"
import { ResetPasswordResponse } from "../../../lib/api/ResetPasswordResponse"
import { buildResponse } from "../../../lib/server/buildResponse"
import { BadRequestException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/resetPassword")({
  server: {
    handlers: {
  POST: async ({ request }) => {
    return buildResponse(request, async () => {
      let { password = "", authCode = "" }: ResetPasswordRequest =
        await request.json()

      validate({ password }).strongPassword()

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
        user.authCodeExpiresAt < dayjs().toDate()
      ) {
        throw new BadRequestException("Reset code expired.")
      }

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
    })
  },

    }
  }
})
