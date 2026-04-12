import { TaskSchedule } from "@prisma/client"
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
      const taskSchedules = await prisma.taskSchedule.findMany({
        where: {
          taskGroup: {
            organizationId,
            users: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      })

      return taskSchedules
    }
    // POST
    else if (req.method === "POST") {
      const requestBody: TaskScheduleCreateRequest = req.body
      const { name, taskGroupId, autoClose, date } = requestBody

      validate({ name }).notEmpty()

      if (taskGroupId === null) {
        throw new Error("Task group ID is required")
      }

      // passed validation, create task schedule
      const taskSchedule = await prisma.taskSchedule.create({
        data: {
          name,
          taskGroupId,
          autoClose,
          createdByUserId: user.id,
          date,
        },
      })
      return taskSchedule
    }
  })
}

export default withSession(handler)

export type TaskScheduleCreateRequest = Omit<
  TaskSchedule,
  "id" | "taskGroupId" | "createdByUserId"
> & {
  taskGroupId: number | null
}

export type TaskScheduleWithIncludes = TaskSchedule & {}
