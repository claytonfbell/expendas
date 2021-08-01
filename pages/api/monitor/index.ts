import { NextApiResponse } from "next"
import { MonitorItem, MonitorResponse } from "../../../lib/api/MonitorResponse"
import { requireAuthentication } from "../../../lib/requireAuthentication"
import { buildMonitorItem } from "../../../lib/server/buildMonitorItem"
import { buildResponse } from "../../../lib/server/buildResponse"
import { NotFoundException } from "../../../lib/server/HttpException"
import prisma from "../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../lib/server/session"
import { organizationInclude } from "../organizations"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    if (req.method === "GET") {
      const user = await requireAuthentication(req, prisma)
      const organizationId = Number(req.query.organizationId)

      const organizations = await prisma.organization.findMany({
        where: {
          id: { equals: organizationId },
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        include: organizationInclude,
      })
      const organiztion = organizations.find((x) => x.id === organizationId)
      if (organiztion === undefined) {
        throw new NotFoundException("Organiztion not found.")
      }

      // fetch some groups
      const groupNames = await prisma.pingSetup.groupBy({
        by: ["groupName"],
        where: { organizationId: { equals: organizationId } },
      })
      groupNames.sort((a, b) => a.groupName.localeCompare(b.groupName))

      const response: MonitorResponse = {
        groups: groupNames.map((x) => {
          return { groupName: x.groupName, items: [] }
        }),
      }

      // populate items
      for (let i = 0; i < response.groups.length; i++) {
        const group = response.groups[i]
        const pingSetups = await prisma.pingSetup.findMany({
          where: {
            groupName: { equals: group.groupName },
            organizationId: { equals: organizationId },
          },
          include: { lastPing: true, lastSuccessfulPing: true },
        })

        const items: MonitorItem[] = []
        for (let j = 0; j < pingSetups.length; j++) {
          const pingSetup = pingSetups[j]

          const item = await buildMonitorItem(pingSetup)
          if (item !== null) {
            items.push(item)
          }
        }

        response.groups[i].items = items
      }

      return response
    }
  })
}

export default withSession(handler)
