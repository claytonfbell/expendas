import dayjs from "../../../lib/dayjs"
import { v4 as uuidv4 } from "uuid"
import { AddUserRequest } from "../../../lib/api/AddUserRequest"
import { requireAdminAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import { NotFoundException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import { sendEmail } from "../../../lib/server/sendEmail"
import validate from "../../../lib/server/validate"
import { organizationInclude } from "./organizations"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/organizations/addUser")({
  server: {
    handlers: {
  POST: async ({ request, params }) => {
    return buildResponse(request, async (session) => {
      let { organizationId, email = "" }: AddUserRequest = await request.json()
      email = email.toLowerCase()
      const user = await requireAdminAuthentication(session, prisma, organizationId)
      const organizations = await prisma.organization.findMany({
        where: {
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        include: organizationInclude,
      })
      let organization = await organizations.find(
        (x) => x.id === organizationId
      )
      if (organization === undefined) {
        throw new NotFoundException("Organization not found.")
      }

      validate({ email }).email()

      // validation passed
      let addUser = await prisma.user.findUnique({ where: { email } })
      if (addUser === null) {
        addUser = await prisma.user.create({
          data: {
            firstName: "",
            lastName: "",
            email,
            passwordHash: "",
            authCode: uuidv4(),
            authCodeExpiresAt: dayjs().add(24, "hours").toDate(),
          },
        })

        // send email
        const text = `You have been invited to Expendas. Use the link to setup a password for your account. This link will expire in **24 hours**. \n\nhttps://expendas.com/setPassword?authCode=${addUser.authCode}.`
        sendEmail({
          to: addUser.email,
          subject: "Setup your Expendas account",
          text,
        })
          .then(() => {
            console.log("Email sent")
          })
          .catch((error) => {
            console.error(error)
          })
      }
      organization = await prisma.organization.update({
        where: { id: organization.id },
        data: {
          users: {
            create: {
              userId: addUser.id,
            },
          },
        },
        include: organizationInclude,
      })

      return organization
    })
  },

    }
  }
})
