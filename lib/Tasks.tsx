import { Stack } from "@mui/material"
import { TaskGroups } from "./TaskGroups"
import { TaskSchedules } from "./TaskSchedules"

export function Tasks() {
  return (
    <Stack spacing={4}>
      <TaskGroups />
      <TaskSchedules />
    </Stack>
  )
}
