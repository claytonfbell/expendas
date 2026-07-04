import dayjs from "../../components/dayjs"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/tasks/stats")({
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

          const thirtyDaysAgo = dayjs()
            .subtract(30, "days")
            .startOf("day")
            .format("YYYY-MM-DD")

          const tasks = await prisma.task.findMany({
            where: {
              completed: true,
              date: {
                gte: thirtyDaysAgo,
              },
              taskSchedule: {
                showStats: true,
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
            include: {
              taskSchedule: {
                include: {
                  taskGroup: true,
                },
              },
            },
          })

          const statsMap: Record<
            string,
            {
              name: string
              groupName: string
              color: string
              completedCount: number
            }
          > = {}

          tasks.forEach((task) => {
            const key = `${task.taskSchedule.taskGroup.name}-${task.taskSchedule.name}`
            if (!statsMap[key]) {
              statsMap[key] = {
                name: task.taskSchedule.name,
                groupName: task.taskSchedule.taskGroup.name,
                color: task.taskSchedule.taskGroup.color,
                completedCount: 0,
              }
            }
            statsMap[key].completedCount++
          })

          return Object.values(statsMap).sort(
            (a, b) =>
              a.groupName.localeCompare(b.groupName) ||
              a.name.localeCompare(b.name)
          )
        })
      },
    },
  },
})