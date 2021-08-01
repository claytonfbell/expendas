// pages/api/login.ts
import { NextApiResponse } from "next"
import { FetchMonitorItemResponse } from "../../../lib/api/FetchMonitorItemResponse"
import { requireAuthentication } from "../../../lib/requireAuthentication"
import { buildMonitorItem } from "../../../lib/server/buildMonitorItem"
import { buildResponse } from "../../../lib/server/buildResponse"
import {
  ForbiddenException,
  NotFoundException,
} from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../lib/server/session"
import { organizationInclude } from "../organizations/index"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const user = await requireAuthentication(req, prisma)
    const pingSetupId = Number(req.query.pingSetupId)
    const pingSetup = await prisma.pingSetup.findUnique({
      where: { id: pingSetupId },
      include: {
        lastPing: true,
        lastSuccessfulPing: true,
      },
    })
    if (pingSetup === null) {
      throw new NotFoundException("Ping Setup not found")
    }

    const organizations = await prisma.organization.findMany({
      where: {
        id: { equals: pingSetup.organizationId },
        users: {
          some: {
            userId: user.id,
          },
        },
      },
      include: organizationInclude,
    })
    if (organizations.length === 0) {
      throw new ForbiddenException()
    }

    const item = await buildMonitorItem(pingSetup)
    if (item === null) {
      throw new NotFoundException("Monitor item not found.")
    }

    // GET
    if (req.method === "GET") {
      // fetch some pings
      const pings = await prisma.ping.findMany({
        where: { pingSetupId: { equals: pingSetup.id } },
        orderBy: [{ id: "desc" }],
        skip: 0,
        take: 200,
      })
      const response: FetchMonitorItemResponse = {
        monitorItem: item,
        pings,
      }

      return response
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.ping.deleteMany({
        where: { pingSetupId: { equals: pingSetup.id } },
      })
      await prisma.pingSetup.delete({
        where: { id: pingSetup.id },
      })
    }
  })
}

export default withSession(handler)
