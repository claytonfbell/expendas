import { Stack } from "@mui/material"
import { TaskGroups } from "./TaskGroups"
import { TaskList } from "./TaskList"
import { TaskSchedules } from "./TaskSchedules"

export function Tasks() {
  return (
    <Stack spacing={4}>
      <TaskList />
      <TaskGroups />
      <TaskSchedules />
    </Stack>
  )
}
