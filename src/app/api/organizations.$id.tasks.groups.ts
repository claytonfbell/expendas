import { TaskGroup } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../../lib/requireAuthentication"
import { buildResponse } from "../../../lib/server/buildResponse"
import prisma from "../../../lib/server/prisma"
import validate from "../../../lib/server/validate"

export const Route = createFileRoute("/api/organizations/$id/tasks/groups")({
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

      const requestBody: TaskGroupCreateRequest = await request.json()
      const { name, color } = requestBody

      validate({ name, color }).notEmpty()

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
    })
  },

    }
  }
})

export type TaskGroupCreateRequest = Omit<TaskGroup, "id" | "organizationId">
