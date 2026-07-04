import dayjs from "../../components/dayjs"
import { createFileRoute } from "@tanstack/react-router"
import { TaskScheduleWithIncludes } from "./taskScheduleTypes"
import { requireOrganizationAuthentication } from "../../components/requireAuthentication"
import { buildResponse } from "../../components/server/buildResponse"
import prisma from "../../components/server/prisma"
import validate from "../../components/server/validate"

dayjs.tz.setDefault("America/Los_Angeles")

export const Route = createFileRoute(
  "/api/organizations/$id/tasks/schedules/$taskScheduleId"
)({
  server: {
    handlers: {  
    async GET({ request, params }) {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const taskScheduleId = Number(params.taskScheduleId)
        const user = await requireOrganizationAuthentication(
          session,
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
  
        return taskSchedule
      })
    },
    async PUT({ request, params }) {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const taskScheduleId = Number(params.taskScheduleId)
        const user = await requireOrganizationAuthentication(
          session,
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
  
        const requestBody: TaskScheduleWithIncludes = await request.json()
        const {
          name,
          taskGroupId,
          description,
          date,
          autoClose,
          showStats,
          repeats,
          repeatsUntilDate,
          repeatsOnDaysOfWeek,
          repeatsOnDaysOfMonth,
          repeatsOnMonthsOfYear,
          repeatsWeekly,
          repeatsOnDates,
        } = requestBody
  
        validate({ name }).notEmpty()
  
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
            showStats,
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
  
        await scheduleTasksForSchedule(updatedTaskSchedule, 90)
  
        return updatedTaskSchedule
      })
    },
    async DELETE({ request, params }) {
      return buildResponse(request, async (session) => {
        const organizationId = Number(params.id)
        const taskScheduleId = Number(params.taskScheduleId)
        const user = await requireOrganizationAuthentication(
          session,
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
  
        await prisma.taskSchedule.delete({
          where: {
            id: taskScheduleId,
          },
        })
      })
    },
  
    }
  }
})

// fallow-ignore-next-line complexity -- temporary migration debt: high cyclomatic + cognitive complexity in scheduler
export async function scheduleTasksForSchedule(
  taskSchedule: TaskScheduleWithIncludes,
  daysAhead: number
) {
  let startDate = dayjs().startOf("day")
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

      repeatsOnThisDate = true

      if (taskSchedule.repeatsOnDaysOfWeek.length > 0) {
        if (!taskSchedule.repeatsOnDaysOfWeek.includes(date.day())) {
          repeatsOnThisDate = false
        }
      }

      if (taskSchedule.repeatsOnDaysOfMonth.length > 0) {
        const isLastDayOfMonth =
          date.date() === date.clone().endOf("month").date()
        const scheduleIncludesThisDay =
          taskSchedule.repeatsOnDaysOfMonth.includes(date.date()) ||
          (isLastDayOfMonth && taskSchedule.repeatsOnDaysOfMonth.includes(31))
        if (!scheduleIncludesThisDay) {
          repeatsOnThisDate = false
        }
      }

      if (taskSchedule.repeatsOnMonthsOfYear.length > 0) {
        if (!taskSchedule.repeatsOnMonthsOfYear.includes(date.month())) {
          repeatsOnThisDate = false
        }
      }

      if (taskSchedule.repeatsWeekly !== null) {
        const weeksSinceStart = date.diff(
          dayjs(`${taskSchedule.date} 00:00:00`).startOf("day"),
          "weeks"
        )
        if (weeksSinceStart % taskSchedule.repeatsWeekly !== 0) {
          repeatsOnThisDate = false
        }
      }

      if (taskSchedule.repeatsUntilDate) {
        if (
          date.isAfter(
            dayjs(`${taskSchedule.repeatsUntilDate} 00:00:00`).endOf("day")
          )
        ) {
          repeatsOnThisDate = false
        }
      }

      if (taskSchedule.repeatsOnDates.includes(date.format("YYYY-MM-DD"))) {
        repeatsOnThisDate = true
      }
    } else {
      console.log(
        "Non repeating schedule, checking date " + date.format("YYYY-MM-DD")
      )
      if (
        date.format("YYYY-MM-DD") ===
        dayjs(`${taskSchedule.date} 00:00:00`).format("YYYY-MM-DD")
      ) {
        console.log("Non repeating schedule matches this date")
        repeatsOnThisDate = true
      }
    }

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
