import { TaskGroup } from "@prisma/client"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import prisma from "../../../../../../lib/server/prisma"
import withSession, {
  NextIronRequest,
} from "../../../../../../lib/server/session"
import validate from "../../../../../../lib/server/validate"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )

    // GET
    if (req.method === "GET") {
      const taskGroups = await prisma.taskGroup.findMany({
        where: {
          organizationId,
          users: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      })

      return taskGroups
    }
    // POST
    else if (req.method === "POST") {
      const requestBody: TaskGroupCreateRequest = req.body
      const { name, color } = requestBody

      validate({ name, color }).notEmpty()

      // passed validation, create task group
      const taskGroup = await prisma.taskGroup.create({
        data: {
          name,
          color,
          organizationId,
          users: {
            create: {
              userId: user.id,
            },
          },
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      })
      return taskGroup
    }
  })
}

export default withSession(handler)

export type TaskGroupCreateRequest = Omit<TaskGroup, "id" | "organizationId">
