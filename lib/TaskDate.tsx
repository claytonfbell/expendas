import SettingsIcon from "@mui/icons-material/Settings"
import TaskAltIcon from "@mui/icons-material/TaskAlt"
import {
  alpha,
  Box,
  Checkbox,
  Chip,
  Fade,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  SvgIconProps,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import moment from "moment"
import { useEffect, useMemo, useState } from "react"
import { TaskWithIncludes } from "../pages/api/organizations/[id]/tasks"
import { TaskScheduleWithIncludes } from "../pages/api/organizations/[id]/tasks/schedules"
import { useAddTaskSchedule, useUpdateTask } from "./api/api"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"
import { TaskScheduleEditDialog } from "./TaskScheduleEditDialog"

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
  const isInThePast = dateObject.isBefore(moment(), "day")

  return (
    <Paper
      variant="outlined"
      sx={{
        paddingX: { xs: 2, xl: 1 },
        paddingY: 1,
        // stretch to fill height of grid item
        height: "100%",
        // lined paper background
        backgroundImage: (theme) => `repeating-linear-gradient(
              to bottom,
              ${theme.palette.background.paper},
              ${theme.palette.background.paper} 29px,
              ${alpha(theme.palette.divider, 0.06)} 30px,
              ${alpha(theme.palette.divider, 0.06)} 31px
            )`,

        position: "relative",

        // fade if in the past and not today
        opacity: isInThePast && !isToday ? 0.4 : 1,
        // desaturate if not today
        filter: isInThePast && !isToday ? "grayscale(100%)" : "none",
      }}
    >
      <Stack
        alignItems={"end"}
        spacing={1}
        position={"absolute"}
        right={12}
        top={12}
      >
        <Stack
          alignItems={"end"}
          sx={{
            color: (theme) =>
              allTasksCompleted
                ? "success.light"
                : isToday
                  ? "primary.light"
                  : theme.palette.text.disabled,
          }}
        >
          <DateText>{dateObject.format("ddd")}</DateText>
          <DateText variant="number">
            <Stack direction={"row"}>
              {allTasksCompleted && <TaskAltIcon fontSize="inherit" />}
              <Stack>{dateObject.format("D")}</Stack>
            </Stack>
          </DateText>
          <DateText>{dateObject.format("MMMM")}</DateText>
        </Stack>
      </Stack>

      <Stack>
        {uniqueTaskGroups.map((groupTasks) => {
          return (
            <TaskItemGroup
              key={groupTasks[0].taskSchedule.taskGroup.id}
              groupTasks={groupTasks}
            />
          )
        })}
      </Stack>
    </Paper>
  )
}

interface DateTextProps {
  children: React.ReactNode
  variant?: "default" | "number"
}

function DateText({ children, variant = "default" }: DateTextProps) {
  return (
    <Box
      sx={{
        fontSize: variant === "number" ? "1.6rem" : "0.75rem",
        lineHeight: 1,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: variant === "number" ? 1 : 2,
      }}
    >
      {children}
    </Box>
  )
}

interface TaskChipProps {
  label: string
  color: "success" | "primary" | "error"
  Icon: React.ElementType<SvgIconProps>
}

function TaskChip({ label, color, Icon }: TaskChipProps) {
  return (
    <Stack position={"relative"} width={128} height={20}>
      <Chip
        label={label}
        size="small"
        icon={<Icon color={color} />}
        sx={{
          position: "absolute",
          right: -8,
          backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
          color: (theme) => alpha(theme.palette[color].main, 0.8),
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      />
    </Stack>
  )
}

interface TaskItemGroupProps {
  groupTasks: TaskWithIncludes[]
}

function TaskItemGroup({ groupTasks }: TaskItemGroupProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const allTasksCompleted = groupTasks.every((task) => task.completed)
  const [editTaskSchedule, setEditTaskSchedule] =
    useState<TaskScheduleWithIncludes | null>(null)

  const date = groupTasks[0].date!

  return (
    <>
      <Stack
        key={groupTasks[0].taskSchedule.taskGroup.id}
        onMouseEnter={() => setShowQuickAdd(true)}
        onMouseLeave={() => setShowQuickAdd(false)}
      >
        <Typography
          variant="subtitle2"
          sx={{
            color: (theme) =>
              allTasksCompleted
                ? alpha(theme.palette.text.primary, 0.3)
                : getHexColorForTaskGroupColor(
                    groupTasks[0].taskSchedule.taskGroup.color,
                    theme.palette.mode
                  ),
            textTransform: "uppercase",
            fontWeight: "bold",
            textDecoration: allTasksCompleted ? "line-through" : "none",
          }}
        >
          {groupTasks[0].taskSchedule.taskGroup.name}
        </Typography>
        <Stack>
          {groupTasks
            // sort by id
            .sort((a, b) => a.id - b.id)
            .map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClickSettings={() => setEditTaskSchedule(task.taskSchedule)}
              />
            ))}
          <Fade in={showQuickAdd}>
            <Stack>
              <QuickAddTaskSchedule
                taskGroupId={groupTasks[0].taskSchedule.taskGroup.id}
                date={date}
              />
            </Stack>
          </Fade>
        </Stack>
      </Stack>

      <TaskScheduleEditDialog
        taskSchedule={editTaskSchedule}
        onClose={() => setEditTaskSchedule(null)}
      />
    </>
  )
}

interface TaskItemProps {
  task: TaskWithIncludes
  onClickSettings: (task: TaskWithIncludes) => void
}

function TaskItem({ task, onClickSettings }: TaskItemProps) {
  const { mutateAsync: updateTask } = useUpdateTask()

  const [state, setState] = useState(task)
  useEffect(() => {
    setState(task)
  }, [task])

  const theme = useTheme()
  const color = state.completed
    ? alpha(theme.palette.text.primary, 0.4)
    : getHexColorForTaskGroupColor(
        task.taskSchedule.taskGroup.color,
        theme.palette.mode
      )

  const [showSettings, setShowSettings] = useState(false)

  return (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"space-between"}
      onMouseEnter={() => setShowSettings(true)}
      onMouseLeave={() => setShowSettings(false)}
      position="relative"
      sx={{
        backgroundColor: showSettings ? alpha(color, 0.08) : "transparent",
        borderRadius: 1,
        padding: 0.25,
      }}
    >
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
              color,
            }}
          >
            {task.taskSchedule.name}
          </Typography>
        }
      />
      <Box
        sx={{
          position: "absolute",
          right: -6,
        }}
      >
        <Fade in={showSettings}>
          <IconButton
            size="small"
            sx={{
              padding: "2px",
              color: alpha(color, 0.6),
            }}
            onClick={() => onClickSettings(task)}
          >
            <SettingsIcon />
          </IconButton>
        </Fade>
      </Box>
    </Stack>
  )
}

interface QuickAddTaskScheduleProps {
  taskGroupId: number
  date: string
}

function QuickAddTaskSchedule({
  taskGroupId,
  date,
}: QuickAddTaskScheduleProps) {
  const { mutateAsync: quickAddTaskSchedule } = useAddTaskSchedule()
  const [name, setName] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (name.trim() === "") return
        quickAddTaskSchedule({
          name,
          date,
          taskGroupId,
          description: null,
          autoClose: false,
          repeats: false,
          repeatsUntilDate: null,
          repeatsOnDaysOfWeek: [],
          repeatsOnDaysOfMonth: [],
          repeatsOnMonthsOfYear: [],
          repeatsWeekly: null,
          repeatsOnDates: [],
        })
        setName("")
      }}
    >
      <Stack paddingLeft={`28px`}>
        <TextField
          fullWidth
          slotProps={{
            input: {
              sx: {
                fontSize: 14,
              },
            },
          }}
          placeholder="Quick Add Task"
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="standard"
        />
      </Stack>
    </form>
  )
}
