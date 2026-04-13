import { Grid, Stack, Typography, alpha } from "@mui/material"
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

  // limit dates at a time to avoid overwhelming the UI - we can add pagination or infinite scroll later if needed
  const uniqueDatesInTasks = useMemo(() => {
    if (!tasks) return []
    const uniqueDatesSet = new Set(tasks.map((task) => task.date))
    return Array.from(uniqueDatesSet).sort().slice(1, 14)
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
        <Grid
          container
          spacing={{ xs: 3, sm: 2, xl: 0 }}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 7 }}
        >
          {/* weekday headers */}
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
            <Grid size={1} key={day} display={{ xs: "none", xl: "block" }}>
              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  color: (theme) => alpha(theme.palette.text.primary, 0.4),
                  fontWeight: "bold",
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}

          {/* need to prefill the grid with empty items until the first date to align the dates with the correct weekday */}
          {tasks &&
            uniqueDatesInTasks.length > 0 &&
            Array.from(
              { length: moment(uniqueDatesInTasks[0]).day() },
              (_, i) => i
            ).map((i) => (
              <Grid
                size={1}
                key={`empty-${i}`}
                display={{ xs: "none", xl: "block" }}
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.divider, 0.05),
                }}
              ></Grid>
            ))}

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
