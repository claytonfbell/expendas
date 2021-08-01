// pages/api/login.ts
import { SHA3 } from "crypto-js"
import { NextApiResponse } from "next"
import { LoginResponse } from "../../lib/api/LoginResponse"
import { RegisterRequest } from "../../lib/api/RegisterRequest"
import { buildResponse } from "../../lib/server/buildResponse"
import { BadRequestException } from "../../lib/server/HttpException"
import prisma from "../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../lib/server/session"
import validate from "../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "POST") {
    let {
      firstName,
      lastName,
      email = "",
      password,
      organization,
    }: RegisterRequest = req.body

    email = email.toLowerCase()

    buildResponse(res, async () => {
      validate({ firstName }).notEmpty()
      validate({ lastName }).notEmpty()
      validate({ organization }).notEmpty()
      validate({ email }).email()
      validate({ password }).strongPassword()

      // check if email is already used
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

      // check if organization name is already used
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

      // validation passed! finalize registration
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

      // validation passed! finalize registration
      // get user from database then:
      req.session.set("user", user)
      await req.session.save()

      const data: LoginResponse = { user }
      return data
    })
  }
}

export default withSession(handler)
