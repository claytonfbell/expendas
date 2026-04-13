import { Task } from "@prisma/client"
import moment from "moment-timezone"
import { NextApiResponse } from "next"
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import validate from "../../../../../lib/server/validate"
import { TaskScheduleWithIncludes } from "./schedules"

moment.tz.setDefault("America/Los_Angeles")

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

      // auto-close overdue tasks before fetching tasks to ensure the UI is up to date
      await autoCloseOverdueTasks(user.id)

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
                // include anything completed within the past hour - this is to ensure tasks that were just completed are still visible in the UI
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
        orderBy: [
          {
            taskSchedule: {
              taskGroup: {
                name: "asc",
              },
            },
          },
          {
            taskSchedule: {
              name: "asc",
            },
          },
        ],
      })
      return tasks
    }
  })
}

export default withSession(handler)

export type TaskWithIncludes = Task & {
  taskSchedule: TaskScheduleWithIncludes
}

async function autoCloseOverdueTasks(closedByUserId: number) {
  const twoDaysAgo = moment().subtract(2, "days").startOf("day")
  await prisma.task.updateMany({
    where: {
      closed: false,
      completed: false,
      date: {
        lte: twoDaysAgo.format("YYYY-MM-DD"),
      },
      taskSchedule: {
        autoClose: true,
      },
    },
    data: {
      closed: true,
      closedAt: moment().toISOString(),
      closedByUserId,
    },
  })
}
