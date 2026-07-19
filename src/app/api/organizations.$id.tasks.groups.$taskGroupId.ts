import { TaskGroup, TaskGroupUser, User } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

export const Route = createFileRoute(
  "/api/organizations/$id/tasks/groups/$taskGroupId"
)({
  server: {
    handlers: {
      async GET({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taskGroupId = Number(params.taskGroupId)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const taskGroup = await prisma.taskGroup.findUnique({
            where: {
              id: taskGroupId,
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

          if (!taskGroup) {
            throw new Error("Task group not found")
          }

          return taskGroup
        })
      },
      async PUT({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taskGroupId = Number(params.taskGroupId)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const taskGroup = await prisma.taskGroup.findUnique({
            where: {
              id: taskGroupId,
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

          if (!taskGroup) {
            throw new Error("Task group not found")
          }

          const requestBody: TaskGroupWithIncludes = await request.json()
          const { name, color, users, sortOrder } = requestBody

          validate({ name, color }).notEmpty()

          const userIds = users.map((u) => u.userId)
          const foundUsers = await prisma.user.findMany({
            where: {
              id: { in: userIds },
              organizations: {
                some: {
                  organizationId: organizationId,
                },
              },
            },
          })
          if (foundUsers.length !== userIds.length) {
            throw new Error("Some users do not belong to the organization")
          }

          const updatedTaskGroup = await prisma.taskGroup.update({
            where: {
              id: taskGroupId,
            },
            data: {
              name,
              color,
              sortOrder,
            },
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          })

          const currentUserIds = updatedTaskGroup.users.map((u) => u.userId)
          const userIdsToAdd = userIds.filter(
            (id) => !currentUserIds.includes(id)
          )
          const userIdsToRemove = currentUserIds.filter(
            (id) => !userIds.includes(id)
          )
          await prisma.taskGroupUser.deleteMany({
            where: {
              taskGroupId,
              userId: { in: userIdsToRemove },
            },
          })
          await prisma.taskGroupUser.createMany({
            data: userIdsToAdd.map((userId) => ({
              taskGroupId,
              userId,
            })),
          })
          return await prisma.taskGroup.findUnique({
            where: {
              id: taskGroupId,
            },
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          })
        })
      },
      async DELETE({ request, params }) {
        return buildResponse(request, async (session) => {
          const organizationId = Number(params.id)
          const taskGroupId = Number(params.taskGroupId)
          const user = await requireOrganizationAuthentication(
            session,
            prisma,
            organizationId
          )

          const taskGroup = await prisma.taskGroup.findUnique({
            where: {
              id: taskGroupId,
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

          if (!taskGroup) {
            throw new Error("Task group not found")
          }

          await prisma.taskGroup.delete({
            where: {
              id: taskGroupId,
            },
          })
        })
      },
    },
  },
})

export type TaskGroupWithIncludes = TaskGroup & {
  users: (TaskGroupUser & {
    user: User
  })[]
}
