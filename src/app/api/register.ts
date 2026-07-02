import CryptoJS from "crypto-js"
const { SHA3 } = CryptoJS
import { LoginResponse } from "../../components/api/LoginResponse"
import { RegisterRequest } from "../../components/api/RegisterRequest"
import { BadRequestException } from "../../components/server/HttpException"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/register")({
  server: {
    handlers: {
  POST: async ({ request }) => {
    return buildResponse(request, async (session) => {
      let {
        firstName,
        lastName,
        email = "",
        password,
        organization,
      }: RegisterRequest = await request.json()

      email = email.toLowerCase()

      validate({ firstName }).notEmpty()
      validate({ lastName }).notEmpty()
      validate({ organization }).notEmpty()
      validate({ email }).email()
      validate({ password }).strongPassword()

      const users = await prisma.user.findMany({
        where: {
          email: {
            equals: email,
          },
        },
      })
      if (users.length > 0) {
        throw new BadRequestException("Email is already in use.")
      }

      const organizations = await prisma.organization.findMany({
        where: {
          name: {
            equals: organization,
          },
        },
      })
      if (organizations.length > 0) {
        throw new BadRequestException("Organization name is already in use.")
      }

      const org = await prisma.organization.create({
        data: { name: organization },
      })
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash: SHA3(password).toString(),
        },
      })
      await prisma.user.update({
        where: { id: user.id },
        data: {
          organizations: { create: { organizationId: org.id, isAdmin: true } },
        },
      })

      session.user = user

      const data: LoginResponse = { user, isSuperAdmin: false }
      return data
    })
  },

    }
  }
})
