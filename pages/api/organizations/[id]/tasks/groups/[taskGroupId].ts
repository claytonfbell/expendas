import { TaskGroup, TaskGroupUser, User } from "@prisma/client"
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
    const taskGroupId = Number(req.query.taskGroupId)
    const user = await requireOrganizationAuthentication(
      req,
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

    // GET
    if (req.method === "GET") {
      return taskGroup
    }
    // PUT
    else if (req.method === "PUT") {
      const requestBody: TaskGroupWithIncludes = req.body
      const { name, color, users } = requestBody

      validate({ name, color }).notEmpty()

      // check each user belongs to the organization
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

      // passed validation, update task group
      const updatedTaskGroup = await prisma.taskGroup.update({
        where: {
          id: taskGroupId,
        },
        data: {
          name,
          color,
        },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      })

      // update task group users
      const currentUserIds = updatedTaskGroup.users.map((u) => u.userId)
      const userIdsToAdd = userIds.filter((id) => !currentUserIds.includes(id))
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
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.taskGroup.delete({
        where: {
          id: taskGroupId,
        },
      })
      res.status(204)
      return
    }
  })
}

export default withSession(handler)

export type TaskGroupWithIncludes = TaskGroup & {
  users: (TaskGroupUser & {
    user: User
  })[]
}
