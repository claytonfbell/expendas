import {
  alpha,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
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
      .slice(
        0,
        isXL ? 21 - moment().day() : isLG ? 12 : isMD ? 9 : isSM ? 6 : 7
      )
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
          spacing={{ xs: 2, xl: 1 }}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 7 }}
        >
          {/* sun, mon, tue, wed, thu, fri, sat */}
          {tasks &&
            isXL &&
            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Grid size={1} key={day}>
                <Typography
                  variant="subtitle2"
                  align="center"
                  sx={{
                    textTransform: "uppercase",
                    color: (theme) => alpha(theme.palette.text.primary, 0.6),
                  }}
                >
                  {day}
                </Typography>
              </Grid>
            ))}
          {/* fill in empty grid items at the beginning so that the first date
          starts on the correct day of the week */}
          {tasks &&
            isXL &&
            uniqueDatesInTasks.length > 0 &&
            Array.from(
              { length: moment(uniqueDatesInTasks[0]).day() },
              (_, i) => i
            ).map((i) => (
              <Grid
                size={1}
                key={"empty-" + i}
                sx={{
                  backgroundColor: (theme) =>
                    alpha(theme.palette.divider, 0.06),
                  borderRadius: 1,
                }}
              />
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
