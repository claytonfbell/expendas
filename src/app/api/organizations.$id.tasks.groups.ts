import { TaskGroup } from "@prisma/client"
import { createFileRoute } from "@tanstack/react-router"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

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
            orderBy: {
              sortOrder: "asc",
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

          const maxSortOrder = await prisma.taskGroup.findFirst({
            where: { organizationId },
            orderBy: { sortOrder: "desc" },
            select: { sortOrder: true },
          })
          const nextSortOrder = (maxSortOrder?.sortOrder ?? -1) + 1

          const taskGroup = await prisma.taskGroup.create({
            data: {
              name,
              color,
              sortOrder: nextSortOrder,
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
    },
  },
})

export type TaskGroupCreateRequest = Omit<
  TaskGroup,
  "id" | "organizationId" | "sortOrder"
>
