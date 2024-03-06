// pages/api/login.ts
import { SHA3 } from "crypto-js"
import { NextApiResponse } from "next"
import { LoginRequest } from "../../lib/api/LoginRequest"
import { LoginResponse } from "../../lib/api/LoginResponse"
import { requireAuthentication } from "../../lib/requireAuthentication"
import { BadRequestException } from "../../lib/server/HttpException"
import { buildResponse } from "../../lib/server/buildResponse"
import prisma from "../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../lib/server/session"
import validate from "../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "DELETE") {
      await req.session.destroy()
      return
    } else if (req.method === "GET") {
      const user = await requireAuthentication(req, prisma)
      const data: LoginResponse = {
        user,
        isSuperAdmin: user.id === Number(process.env.SUPER_ADMIN_USER_ID),
      }
      return data
    } else if (req.method === "POST") {
      let { email = "", password }: LoginRequest = req.body
      email = email.toLowerCase()

      validate({ email }).email()
      validate({ password }).notEmpty()

      // check if email is already used
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (user === null) {
        throw new BadRequestException("User not found with email.")
      }

      // authenticate password
      // todo - prevent brute force by limiting attempts
      if (user.passwordHash !== SHA3(password).toString()) {
        throw new BadRequestException("Password does not match.")
      }

      // validation passed! finalize registration
      // get user from database then:
      req.session.set("user", user)
      await req.session.save()

      const data: LoginResponse = {
        user,
        isSuperAdmin: user.id === Number(process.env.SUPER_ADMIN_USER_ID),
      }
      return data
    }
  })
}

export default withSession(handler)
