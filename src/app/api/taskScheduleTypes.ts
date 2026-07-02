import { TaskGroup, TaskSchedule } from "@prisma/client"

export type TaskScheduleCreateRequest = Omit<
  TaskSchedule,
  "id" | "taskGroupId" | "createdByUserId"
> & {
  taskGroupId: number | null
}

export type TaskScheduleWithIncludes = TaskSchedule & {
  taskGroup: TaskGroup
}