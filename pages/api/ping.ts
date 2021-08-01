// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next"
import { PingRequest } from "../../lib/api/PingRequest"
import { buildResponse } from "../../lib/server/buildResponse"
import { ForbiddenException } from "../../lib/server/HttpException"
import prisma from "../../lib/server/prisma"
import validate from "../../lib/server/validate"

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "POST") {
      let {
        name = "",
        groupName = "",
        interval = 0,
        apiKey = "",
        tag = null,
        details = null,
        progressBar = null,
        success = true,
        emails = null,
      }: Partial<PingRequest> = req.body

      const apiKeyRow = await prisma.apiKey.findUnique({ where: { apiKey } })
      if (apiKeyRow === null) {
        throw new ForbiddenException()
      }

      validate({ name }).notEmpty()
      validate({ groupName }).notEmpty()
      validate({ interval }).greaterThanZero()
      validate({ apiKey }).notEmpty()

      // validation passed

      // find existing pingSetup
      let pingSetup = await prisma.pingSetup.findFirst({
        where: {
          organizationId: { equals: apiKeyRow.organizationId },
          name: { equals: name },
          groupName: { equals: groupName },
        },
      })

      // create new
      if (pingSetup === null) {
        pingSetup = await prisma.pingSetup.create({
          data: {
            organizationId: apiKeyRow.organizationId,
            name,
            groupName,
          },
        })
      }

      // set emails
      if (emails !== null) {
        pingSetup = await prisma.pingSetup.update({
          where: { id: pingSetup.id },
          data: {
            emails: emails
              .filter((x) => x.trim() !== "")
              .map((x) => x.toLowerCase()),
          },
        })
      }

      // insert the ping
      const lastPing = await prisma.ping.create({
        data: {
          pingSetupId: pingSetup.id,
          tag,
          details,
          interval,
          time: new Date(),
          progressBar,
          success,
        },
        include: { pingSetup: true },
      })

      // set lastPing and lastSuccessfulPing
      await prisma.pingSetup.update({
        where: { id: pingSetup.id },
        data: {
          lastPingId: lastPing.id,
          lastSuccessfulPingId: success ? lastPing.id : undefined,
        },
      })

      return lastPing
    }
  })
}

export default handler
