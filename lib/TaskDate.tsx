import CheckIcon from "@mui/icons-material/Check"
import {
  alpha,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import { TaskWithIncludes } from "../pages/api/organizations/[id]/tasks"
import { useUpdateTask } from "./api/api"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"

interface Props {
  date: string
  tasks: TaskWithIncludes[]
}

export function TaskDate({ date, tasks }: Props) {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.date === date)
  }, [tasks, date])

  const dateObject = moment(date, "YYYY-MM-DD")
  const isToday = dateObject.isSame(moment(), "day")

  const uniqueTaskGroups = useMemo(() => {
    const groupsMap: Record<string, TaskWithIncludes[]> = {}
    filteredTasks.forEach((task) => {
      const groupId = task.taskSchedule.taskGroup.id
      if (!groupsMap[groupId]) {
        groupsMap[groupId] = []
      }
      groupsMap[groupId].push(task)
    })
    return Object.values(groupsMap)
  }, [filteredTasks])

  const allTasksCompleted = filteredTasks.every((task) => task.completed)

  return (
    <Paper
      sx={{
        paddingY: 1,
        paddingX: 2,
        // stretch to fill height of grid item
        height: "100%",
        minHeight: 200,
        borderRadius: { xl: 0 },
        // lined paper background
        backgroundImage: (theme) => `repeating-linear-gradient(
              to bottom,
              ${theme.palette.background.paper},
              ${theme.palette.background.paper} 29px,
              ${alpha(theme.palette.divider, 0.06)} 30px,
              ${alpha(theme.palette.divider, 0.06)} 31px
            )`,
        position: "relative",
      }}
    >
      {/* xl size */}
      <Stack
        display={{ xs: "none", xl: "flex" }}
        alignItems={"end"}
        position={"absolute"}
        right={8}
        top={8}
        sx={{
          fontWeight: "bold",
          fontSize: "1.2rem",
          color: (theme) => alpha(theme.palette.text.primary, 0.3),
        }}
      >
        {dateObject.format(" Do")}
      </Stack>

      {/* normal date display */}
      <Stack
        display={{ xs: "flex", xl: "none" }}
        alignItems={"end"}
        spacing={1}
        position={"absolute"}
        right={16}
        top={16}
      >
        <Stack
          sx={{
            color: (theme) => alpha(theme.palette.text.disabled, 0.3),
            fontSize: "1.2rem",
            lineHeight: 0.75,
          }}
        >
          {dateObject.format("dddd")}
        </Stack>
        <Stack
          sx={{
            color: (theme) => alpha(theme.palette.text.disabled, 0.3),
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          {dateObject.format("MMMM Do")}
        </Stack>
        {isToday && (
          <Chip
            label="Today"
            size="small"
            color="primary"
            sx={{
              fontWeight: "bold",
            }}
          />
        )}
        {allTasksCompleted && (
          <Chip
            label="All Completed"
            size="small"
            icon={<CheckIcon color="success" />}
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.success.main, 0.1),
              color: (theme) => alpha(theme.palette.success.main, 0.8),
              fontWeight: "bold",
            }}
          />
        )}
      </Stack>

      <Stack spacing={2}>
        {uniqueTaskGroups.map((groupTasks) => {
          const allTasksCompleted = groupTasks.every((task) => task.completed)
          return (
            <Stack key={groupTasks[0].taskSchedule.taskGroup.id}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: (theme) =>
                    allTasksCompleted
                      ? alpha(theme.palette.text.primary, 0.3)
                      : getHexColorForTaskGroupColor(
                          groupTasks[0].taskSchedule.taskGroup.color
                        ),
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  textDecoration: allTasksCompleted ? "line-through" : "none",
                }}
              >
                {groupTasks[0].taskSchedule.taskGroup.name}
              </Typography>
              <Stack>
                {groupTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </Stack>
            </Stack>
          )
        })}
      </Stack>
    </Paper>
  )
}

function TaskItem({ task }: { task: TaskWithIncludes }) {
  const { mutateAsync: updateTask } = useUpdateTask()

  const [state, setState] = useState(task)
  useEffect(() => {
    setState(task)
  }, [task])

  const color = getHexColorForTaskGroupColor(task.taskSchedule.taskGroup.color)

  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{
            marginY: 0,
            paddingY: 0,
            color,
            // checked color
            "&.Mui-checked": {
              color,
            },
          }}
          size="small"
          checked={state.completed}
          onChange={(e, checked) => {
            setState((prev) => ({ ...prev, completed: checked }))
            updateTask({ ...state, completed: checked })
          }}
        />
      }
      label={
        <Typography
          variant="body2"
          sx={{
            textDecoration: state.completed ? "line-through" : "none",
            color: state.completed
              ? (theme) => alpha(theme.palette.text.primary, 0.4)
              : "inherit",
          }}
        >
          {task.taskSchedule.name}
        </Typography>
      }
    />
  )
}
