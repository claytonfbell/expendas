import moment from "moment"
import { NextApiResponse } from "next"
import { TaskWithIncludes } from "."
import { requireOrganizationAuthentication } from "../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../lib/server/buildResponse"
import prisma from "../../../../../lib/server/prisma"
import withSession, { NextIronRequest } from "../../../../../lib/server/session"
import { TaskScheduleWithIncludes } from "./schedules"

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

async function scheduleTasksForSchedule(
  taskSchedule: TaskScheduleWithIncludes,
  daysAhead: number
) {
  // this will populate task table with tasks
  let startDate = moment(`${taskSchedule.date} 00:00:00`).startOf("day")

  // we don't want to add/remove tasks in the past
  const today = moment().startOf("day")
  if (startDate.isBefore(today)) {
    startDate = today.clone()
  }

  // loop daysAhead into the future and create tasks for any dates that match the schedule
  for (let i = 0; i <= daysAhead; i++) {
    const date = startDate.clone().add(i, "days")

    let repeatsOnThisDate = false
    const exists = await prisma.task.findFirst({
      where: {
        taskScheduleId: taskSchedule.id,
        date: date.format("YYYY-MM-DD"),
      },
    })

    if (taskSchedule.repeats) {
      console.log("Checking date " + date.format("YYYY-MM-DD"))

      repeatsOnThisDate = true // default

      // check days of the week if specified
      if (taskSchedule.repeatsOnDaysOfWeek.length > 0) {
        if (!taskSchedule.repeatsOnDaysOfWeek.includes(date.day())) {
          repeatsOnThisDate = false
        }
      }

      // check days of the month if specified
      if (taskSchedule.repeatsOnDaysOfMonth.length > 0) {
        // if last day of the month and schedule specifies 31, treat as match
        const isLastDayOfMonth =
          date.date() === date.clone().endOf("month").date()
        const scheduleIncludesThisDay =
          taskSchedule.repeatsOnDaysOfMonth.includes(date.date()) ||
          (isLastDayOfMonth && taskSchedule.repeatsOnDaysOfMonth.includes(31))
        if (!scheduleIncludesThisDay) {
          repeatsOnThisDate = false
        }
      }

      // check months of the year if specified
      if (taskSchedule.repeatsOnMonthsOfYear.length > 0) {
        if (!taskSchedule.repeatsOnMonthsOfYear.includes(date.month())) {
          repeatsOnThisDate = false
        }
      }

      // check weekly repeats if specified
      if (taskSchedule.repeatsWeekly !== null) {
        const weeksSinceStart = date.diff(
          moment(`${taskSchedule.date} 00:00:00`).startOf("day"),
          "weeks"
        )
        if (weeksSinceStart % taskSchedule.repeatsWeekly !== 0) {
          repeatsOnThisDate = false
        }
      }

      // check end date if specified
      if (taskSchedule.repeatsUntilDate) {
        if (
          date.isAfter(
            moment(`${taskSchedule.repeatsUntilDate} 00:00:00`).endOf("day")
          )
        ) {
          repeatsOnThisDate = false
        }
      }

      // always repeats on dates if specified
      if (taskSchedule.repeatsOnDates.includes(date.format("YYYY-MM-DD"))) {
        repeatsOnThisDate = true
      }
    }

    // if this is the date
    if (date.isSame(moment(`${taskSchedule.date} 00:00:00`).startOf("day"))) {
      repeatsOnThisDate = true
    }

    // remove task - no longer repeats on this date
    if (exists && !repeatsOnThisDate) {
      console.log("Deleting task for date " + date.format("YYYY-MM-DD"))
      await prisma.task.delete({
        where: {
          id: exists.id,
        },
      })
    } else if (exists === null && repeatsOnThisDate) {
      console.log("Creating task for date " + date.format("YYYY-MM-DD"))
      await prisma.task.create({
        data: {
          taskScheduleId: taskSchedule.id,
          date: date.format("YYYY-MM-DD"),
        },
      })
    }
  }
}
