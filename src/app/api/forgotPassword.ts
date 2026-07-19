import dayjs from "../../components/dayjs"
import { v4 as uuidv4 } from "uuid"
import { ForgotPasswordRequestData } from "../../components/api/types/ForgotPasswordRequestData"
import { ForgotPasswordResponseData } from "../../components/api/types/ForgotPasswordResponseData"
import { buildResponse } from "../../components/server/buildResponse"
import { BadRequestException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import { sendEmail } from "../../components/server/sendEmail"
import validate from "../../components/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/forgotPassword")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return buildResponse(request, async () => {
          let { email = "" }: ForgotPasswordRequestData = await request.json()
          email = email.toLowerCase()

          validate({ email }).email()

          let user = await prisma.user.findUnique({
            where: {
              email,
            },
          })
          if (user === null) {
            throw new BadRequestException("User not found with email.")
          }

          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              authCode: uuidv4(),
              authCodeExpiresAt: dayjs().add(10, "minutes").toDate(),
            },
          })

          const text = `Use this link to setup a new password, code expires in **10 minutes**. \n\nhttps://expendas.com/setPassword?authCode=${user.authCode}.`
          sendEmail({ to: user.email, subject: "Password Reset Code", text })
            .then(() => {
              console.log("Email sent")
            })
            .catch((error) => {
              console.error(error)
            })

          const response: ForgotPasswordResponseData = {
            message: "Check your email for a link to reset your password.",
          }
          return response
        })
      },
    },
  },
})
