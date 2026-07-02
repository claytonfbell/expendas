import { Task } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import dayjs from "../../../lib/dayjs"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"
import { TaskScheduleWithIncludes } from "./organizations.$id.tasks.schedules"

dayjs.tz.setDefault("America/Los_Angeles")

export const Route = createFileRoute("/api/organizations/$id/tasks")({
  server: {
    handlers: {
      async GET({ request, params }) {
        return await buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )
          const queryParams = new URL(request.url).searchParams
          const startDate = queryParams.get("startDate") as string
          const endDate = queryParams.get("endDate") as string

          validate({ startDate, endDate }).notNull()

          const oneHourAgo = dayjs().subtract(1, "hour")

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
                        gte: dayjs(`${startDate} 00:00:00`).format(
                          "YYYY-MM-DD"
                        ),
                        lte: dayjs(`${endDate} 00:00:00`)
                          .endOf("day")
                          .format("YYYY-MM-DD"),
                      },
                    },
                    {
                      completed: false,
                      closed: false,
                      date: {
                        lte: dayjs(`${startDate} 00:00:00`)
                          .endOf("day")
                          .format("YYYY-MM-DD"),
                      },
                    },
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
        })
      },
    },
  },
})

export type TaskWithIncludes = Task & {
  taskSchedule: TaskScheduleWithIncludes
}

async function autoCloseOverdueTasks(closedByUserId: number) {
  const twoDaysAgo = dayjs().subtract(2, "days").startOf("day")
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
      closedAt: dayjs().toISOString(),
      closedByUserId,
    },
  })
}
