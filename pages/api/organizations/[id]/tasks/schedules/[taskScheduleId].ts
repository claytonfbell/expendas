import moment from "moment-timezone"
import { NextApiResponse } from "next"
import { TaskScheduleWithIncludes } from "."
import { requireOrganizationAuthentication } from "../../../../../../lib/requireAuthentication"
import { buildResponse } from "../../../../../../lib/server/buildResponse"
import prisma from "../../../../../../lib/server/prisma"
import withSession, {
  NextIronRequest,
} from "../../../../../../lib/server/session"
import validate from "../../../../../../lib/server/validate"

moment.tz.setDefault("America/Los_Angeles")

async function handler(
  req: NextIronRequest,
  res: NextApiResponse
): Promise<void> {
  buildResponse(res, async () => {
    const organizationId = Number(req.query.id)
    const taskScheduleId = Number(req.query.taskScheduleId)
    const user = await requireOrganizationAuthentication(
      req,
      prisma,
      organizationId
    )

    const taskSchedule = await prisma.taskSchedule.findUnique({
      where: {
        id: taskScheduleId,
        taskGroup: {
          organizationId,
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    })

    if (!taskSchedule) {
      throw new Error("Task schedule not found")
    }

    // GET
    if (req.method === "GET") {
      return taskSchedule
    }
    // PUT
    else if (req.method === "PUT") {
      const requestBody: TaskScheduleWithIncludes = req.body
      const {
        name,
        taskGroupId,
        description,
        date,
        autoClose,
        repeats,
        repeatsUntilDate,
        repeatsOnDaysOfWeek,
        repeatsOnDaysOfMonth,
        repeatsOnMonthsOfYear,
        repeatsWeekly,
        repeatsOnDates,
      } = requestBody

      validate({ name }).notEmpty()

      // check task group belongs to the organization and user has access
      const taskGroup = await prisma.taskGroup.findFirst({
        where: {
          id: taskGroupId,
          organizationId,
          users: {
            some: {
              userId: user.id,
            },
          },
        },
      })

      if (!taskGroup) {
        throw new Error("Task group not found")
      }

      // passed validation, update task group
      const updatedTaskSchedule = await prisma.taskSchedule.update({
        where: {
          id: taskScheduleId,
        },
        data: {
          name,
          taskGroupId,
          description,
          date,
          autoClose,
          repeats,
          repeatsUntilDate,
          repeatsOnDaysOfWeek,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
          repeatsOnDates,
        },
        include: {
          taskGroup: true,
        },
      })

      // reschedule tasks for the next 90 days based on the updated schedule
      await scheduleTasksForSchedule(updatedTaskSchedule, 90)

      return updatedTaskSchedule
    }
    // DELETE
    else if (req.method === "DELETE") {
      await prisma.taskSchedule.delete({
        where: {
          id: taskScheduleId,
        },
      })
      res.status(204).end()
      return
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
    } else {
      // if this is the date on non repeating schedule, then it should be this specific date
      if (
        date.format("YYYY-MM-DD") ===
        moment(`${taskSchedule.date} 00:00:00`).format("YYYY-MM-DD")
      ) {
        repeatsOnThisDate = true
      }
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
