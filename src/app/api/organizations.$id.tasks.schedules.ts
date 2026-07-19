import { createFileRoute } from "@tanstack/react-router"
import dayjs from "../../components/dayjs"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"
import { scheduleTasksForSchedule } from "./organizations.$id.tasks.schedules.$taskScheduleId"
import type { TaskScheduleCreateRequest } from "./taskScheduleTypes"
export type {
  TaskScheduleCreateRequest,
  TaskScheduleWithIncludes,
} from "./taskScheduleTypes"

export const Route = createFileRoute("/api/organizations/$id/tasks/schedules")({
  server: {
    handlers: {
      async GET({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const ago = dayjs()
            .subtract(7, "day")
            .startOf("day")
            .format("YYYY-MM-DD")

          const taskSchedules = await prisma.taskSchedule.findMany({
            where: {
              AND: [
                {
                  taskGroup: {
                    organizationId,
                    users: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                },
                {
                  OR: [
                    {
                      repeats: false,
                      date: {
                        gte: ago,
                      },
                    },
                    {
                      repeats: true,
                    },
                  ],
                },
              ],
            },
            include: {
              taskGroup: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
          })

          // ensure tasks are scheduled for each task schedule
          for (const taskSchedule of taskSchedules) {
            await scheduleTasksForSchedule(taskSchedule, 90)
          }

          return taskSchedules
        })
      },
      async POST({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const requestBody: TaskScheduleCreateRequest = await request.json()
          const { name, taskGroupId, autoClose, showStats, date } = requestBody

          validate({ name }).notEmpty()

          if (taskGroupId === null) {
            throw new Error("Task group ID is required")
          }

          const maxSortOrder = await prisma.taskSchedule.findFirst({
            where: { taskGroupId },
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true },
          })
          const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1

          const taskSchedule = await prisma.taskSchedule.create({
            data: {
              name,
              taskGroupId,
              autoClose,
              showStats,
              sortOrder: nextSortOrder,
              createdByUserId: user.id,
              date,
            },
            include: {
              taskGroup: true,
            },
          })

          await scheduleTasksForSchedule(taskSchedule, 90)

          return taskSchedule
        })
      },
    },
  },
})
