import dayjs from "../../../lib/dayjs"
import { createFileRoute } from "@tanstack/react-router"
import { TaskWithIncludes } from "./organizations.$id.tasks"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"

export const Route = createFileRoute("/api/organizations/$id/tasks/$taskId")({
  server: {
    handlers: {
  async GET({ request, params }) {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const taskId = Number(params.taskId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )

      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
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

      if (!task) {
        throw new Error("Task not found")
      }

      return task
    })
  },
  async PUT({ request, params }) {
    return buildResponse(request, async (session) => {
      const organizationId = Number(params.id)
      const taskId = Number(params.taskId)
      const user = await requireOrganizationAuthentication(
        session,
        prisma,
        organizationId
      )

      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
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

      if (!task) {
        throw new Error("Task not found")
      }

      const requestBody: TaskWithIncludes = await request.json()
      const { completed, closed } = requestBody

      return await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          completed,
          closed,
          ...(completed && !task.completed
            ? {
                completedAt: dayjs().toISOString(),
                completedByUserId: user.id,
              }
            : {}),
          ...(closed && !task.closed
            ? {
                closedAt: dayjs().toISOString(),
                closedByUserId: user.id,
              }
            : {}),
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
    })
  },

    }
  }
})
