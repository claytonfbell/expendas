import { TaskGroup, TaskSchedule } from "@prisma/client"

export type TaskScheduleCreateRequest = Omit<
  TaskSchedule,
  "id" | "taskGroupId" | "createdByUserId" | "sortOrder"
> & {
  taskGroupId: number | null
}

export type TaskScheduleWithIncludes = TaskSchedule & {
  taskGroup: TaskGroup
}
