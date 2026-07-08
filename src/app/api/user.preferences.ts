import CryptoJS from "crypto-js"
const { SHA3 } = CryptoJS
import { createFileRoute } from "@tanstack/react-router"
import { requireAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute("/api/user/preferences")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          return {
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              receiveDigestEmails: user.receiveDigestEmails,
              digestEmailTimes: user.digestEmailTimes,
              digestEmailDays: user.digestEmailDays,
            },
          }
        })
      },
      PUT: async ({ request }) => {
        return buildResponse(request, async (session) => {
          const user = await requireAuthentication(session, prisma)
          const body = await request.json()
          const { firstName, lastName, receiveDigestEmails, digestEmailTimes, digestEmailDays } = body

          if (firstName !== undefined) {
            validate({ firstName }).notNull().min(1)
          }
          if (lastName !== undefined) {
            validate({ lastName }).notNull().min(1)
          }
          if (receiveDigestEmails !== undefined) {
            validate({ receiveDigestEmails }).boolean()
          }
          if (digestEmailTimes !== undefined) {
            validate({ digestEmailTimes }).notNull()
          }
          if (digestEmailDays !== undefined) {
            validate({ digestEmailDays }).notNull()
          }

          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              ...(firstName !== undefined && { firstName }),
              ...(lastName !== undefined && { lastName }),
              ...(receiveDigestEmails !== undefined && { receiveDigestEmails }),
              ...(digestEmailTimes !== undefined && { digestEmailTimes }),
              ...(digestEmailDays !== undefined && { digestEmailDays }),
            },
          })

          return {
            user: {
              id: updatedUser.id,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
              receiveDigestEmails: updatedUser.receiveDigestEmails,
              digestEmailTimes: updatedUser.digestEmailTimes,
              digestEmailDays: updatedUser.digestEmailDays,
            },
          }
        })
      },
    },
  },
})