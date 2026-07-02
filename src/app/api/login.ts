import CryptoJS from "crypto-js"
const { SHA3 } = CryptoJS
import { LoginRequest } from "../../components/api/LoginRequest"
import { LoginResponse } from "../../components/api/LoginResponse"
import { requireAuthentication } from "../../components/requireAuthentication"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
  POST: async ({ request }) => {
    return buildResponse(request, async (session) => {
      let { email = "", password }: LoginRequest = await request.json()
      email = email.toLowerCase()

      validate({ email }).email()
      validate({ password }).notEmpty()

      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (user === null) {
        throw new BadRequestException("User not found with email.")
      }

      if (user.passwordHash !== SHA3(password).toString()) {
        throw new BadRequestException("Password does not match.")
      }

      session.user = user

      const data: LoginResponse = {
        user,
        isSuperAdmin: user.id === Number(process.env.SUPER_ADMIN_USER_ID),
      }
      return data
    })
  },
  GET: async ({ request }) => {
    return buildResponse(request, async (session) => {
      const user = await requireAuthentication(session, prisma)
      const data: LoginResponse = {
        user,
        isSuperAdmin: user.id === Number(process.env.SUPER_ADMIN_USER_ID),
      }
      return data
    })
  },
  DELETE: async ({ request }) => {
    return buildResponse(request, async (session) => {
      session.destroy()
      return
    })
  },

    }
  }
})
