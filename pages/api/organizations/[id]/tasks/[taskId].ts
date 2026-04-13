import moment from "moment"
import { NextApiResponse } from "next"
import { TaskWithIncludes } from "."
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const taskId = Number(req.query.taskId)
    const user = await requireOrganizationAuthentication(
      req,
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

    // GET
    if (req.method === "GET") {
      return task
    }
    // PUT
    else if (req.method === "PUT") {
      const requestBody: TaskWithIncludes = req.body
      const { completed, closed } = requestBody

      // passed validation, update task group
      return await prisma.task.update({
        where: {
          id: taskId,
        },
        data: {
          completed,
          closed,
          // if marking completed from incomplete
          ...(completed && !task.completed
            ? {
                completedAt: moment().toISOString(),
                completedByUserId: user.id,
              }
            : {}),
          // if marking closed from open
          ...(closed && !task.closed
            ? {
                closedAt: moment().toISOString(),
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
    }
  })
}

export default withSession(handler)
