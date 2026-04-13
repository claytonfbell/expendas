import { Grid, Stack, Typography } from "@mui/material"
import moment from "moment"
import { useMemo, useState } from "react"
import { useFetchTasks } from "./api/api"
import { TaskDate } from "./TaskDate"

export function TaskList() {
  const [state, setState] = useState({
    startDate: moment().startOf("day").format("YYYY-MM-DD"),
    endDate: moment().add(7, "days").startOf("day").format("YYYY-MM-DD"),
  })
  const { data: tasks } = useFetchTasks(state.startDate, state.endDate)

  const uniqueDatesInTasks = useMemo(() => {
    if (!tasks) return []
    const uniqueDatesSet = new Set(tasks.map((task) => task.date))
    return Array.from(uniqueDatesSet).sort()
  }, [tasks])

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h1">Tasks</Typography>
        </Stack>
        <Grid container spacing={2}>
          {tasks &&
            uniqueDatesInTasks.map((date) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={date}>
                <TaskDate date={date} tasks={tasks} />
              </Grid>
            ))}
        </Grid>
      </Stack>
    </>
  )
}
