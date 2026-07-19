import CryptoJS from "crypto-js"
const { SHA3 } = CryptoJS
import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import { BadRequestException } from "../../components/server/HttpException"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute("/api/user/password")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          const { currentPassword, newPassword } = await request.json()

          validate({ currentPassword }).notEmpty()
          validate({ newPassword }).strongPassword()

          if (user.passwordHash !== SHA3(currentPassword).toString()) {
            throw new BadRequestException("Current password is incorrect.")
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: SHA3(newPassword).toString() },
          })

          return { success: true }
        })
      },
    },
  },
})
