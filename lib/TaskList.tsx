import { Grid, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import moment from "moment"
import { useMemo, useState } from "react"
import { useFetchTasks } from "./api/api"
import { TaskDate } from "./TaskDate"

export function TaskList() {
  const [state, setState] = useState({
    startDate: moment().startOf("day").format("YYYY-MM-DD"),
    endDate: moment().add(3, "weeks").startOf("day").format("YYYY-MM-DD"),
  })
  const { data: tasks } = useFetchTasks(state.startDate, state.endDate)

  // limit to 7 dates at a time to avoid overwhelming the UI - we can add pagination or infinite scroll later if needed
  const theme = useTheme()
  const isXL = useMediaQuery(theme.breakpoints.up("xl"))
  const isLG = useMediaQuery(theme.breakpoints.up("lg"))
  const isMD = useMediaQuery(theme.breakpoints.up("md"))
  const isSM = useMediaQuery(theme.breakpoints.up("sm"))

  const uniqueDatesInTasks = useMemo(() => {
    if (!tasks) return []
    const uniqueDatesSet = new Set(tasks.map((task) => task.date))
    return Array.from(uniqueDatesSet)
      .sort()
      .slice(0, isXL ? 15 : isLG ? 12 : isMD ? 9 : isSM ? 6 : 7)
  }, [tasks, isXL, isLG, isMD, isSM])

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
        <Grid
          container
          spacing={2}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        >
          {tasks &&
            uniqueDatesInTasks.map((date) => (
              <Grid size={1} key={date}>
                <TaskDate date={date} tasks={tasks} />
              </Grid>
            ))}
        </Grid>
      </Stack>
    </>
  )
}
