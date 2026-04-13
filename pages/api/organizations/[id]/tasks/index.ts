import { Task } from "@prisma/client"
import moment from "moment"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import validate from "../../../../../lib/server/validate"
import { TaskScheduleWithIncludes } from "./schedules"

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
      const startDate = req.query.startDate as string
      const endDate = req.query.endDate as string

      validate({ startDate, endDate }).notNull()

      const oneHourAgo = moment().subtract(1, "hour")

      const tasks = await prisma.task.findMany({
        where: {
          AND: [
            {
              taskSchedule: {
                taskGroup: {
                  organizationId,
                  users: {
                    some: {
                      userId: user.id,
                    },
                  },
                },
              },
            },
            {
              OR: [
                {
                  date: {
                    gte: moment(`${startDate} 00:00:00`).format("YYYY-MM-DD"),
                    lte: moment(`${endDate} 00:00:00`)
                      .endOf("day")
                      .format("YYYY-MM-DD"),
                  },
                },
                // include overdue tasks that are not completed or closed
                {
                  completed: false,
                  closed: false,
                  date: {
                    lte: moment(`${startDate} 00:00:00`)
                      .endOf("day")
                      .format("YYYY-MM-DD"),
                  },
                },
                // include completd within the past hour
                {
                  completed: true,
                  completedAt: {
                    gte: oneHourAgo.toISOString(),
                  },
                },
              ],
            },
          ],
        },
        include: {
          taskSchedule: {
            include: {
              taskGroup: {
                include: {
                  users: true,
                },
              },
            },
          },
        },
      })
      return tasks
    }
  })
}

export default withSession(handler)

export type TaskWithIncludes = Task & {
  taskSchedule: TaskScheduleWithIncludes
}
