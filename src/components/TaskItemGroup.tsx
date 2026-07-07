import {
  alpha,
  Box,
  Fade,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"
import type { TaskWithIncludes } from "../app/api/organizations.$id.tasks"
import type { TaskScheduleWithIncludes } from "../app/api/organizations.$id.tasks.schedules"
import { useAddTaskSchedule } from "./api/hooks/useAddTaskSchedule"
import { useReorderTaskSchedules } from "./api/hooks/useReorderTaskSchedules"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"
import { TaskItem } from "./TaskItem"
import { TaskScheduleEditDialog } from "./TaskScheduleEditDialog"

interface TaskItemGroupProps {
  groupTasks: TaskWithIncludes[]
}

export function TaskItemGroup({ groupTasks }: TaskItemGroupProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const allTasksCompleted = groupTasks.every((task) => task.completed)
  const [editTaskSchedule, setEditTaskSchedule] =
    useState<TaskScheduleWithIncludes | null>(null)

  const { mutateAsync: reorderSchedules } = useReorderTaskSchedules()

  const date = groupTasks[0].date!
  const taskGroupId = groupTasks[0].taskSchedule.taskGroup.id

  const sortedTasks = useMemo(() => {
    return [...groupTasks].sort(
      (a, b) => a.taskSchedule.sortOrder - b.taskSchedule.sortOrder
    )
  }, [groupTasks])

  const [orderedTasks, setOrderedTasks] = useState(sortedTasks)
  const orderedTasksRef = useRef<TaskWithIncludes[]>([])
  const prevSortOrderRef = useRef("")

  useEffect(() => {
    const sortOrderKey = sortedTasks
      .map((t) => `${t.taskSchedule.id}:${t.taskSchedule.sortOrder}`)
      .join(",")
    if (sortOrderKey !== prevSortOrderRef.current) {
      prevSortOrderRef.current = sortOrderKey
      setOrderedTasks(sortedTasks)
    }
  }, [sortedTasks])

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
        <DragDropProvider
          onDragStart={() => {
            orderedTasksRef.current = [...orderedTasks]
          }}
          onDragEnd={(event) => {
            if (event.canceled) {
              setOrderedTasks(orderedTasksRef.current)
              return
            }
            const { source } = event.operation
            if (isSortable(source)) {
              const { initialIndex, index } = source
              if (initialIndex === index) return
              const newTasks = [...orderedTasks]
              const [removed] = newTasks.splice(initialIndex, 1)
              newTasks.splice(index, 0, removed)
              setOrderedTasks(newTasks)
              reorderSchedules({
                items: newTasks.map((task, i) => ({
                  id: task.taskSchedule.id,
                  sortOrder: i,
                })),
              })
            }
          }}
        >
          <Stack>
            {orderedTasks.map((task, index) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                index={index}
                group={taskGroupId}
                onClickSettings={() =>
                  setEditTaskSchedule(task.taskSchedule)
                }
              />
            ))}
          </Stack>
        </DragDropProvider>
        <Fade in={showQuickAdd}>
          <Stack>
            <QuickAddTaskSchedule
              taskGroupId={taskGroupId}
              date={date}
            />
          </Stack>
        </Fade>
      </Stack>

      <TaskScheduleEditDialog
        taskSchedule={editTaskSchedule}
        onClose={() => setEditTaskSchedule(null)}
      />
    </>
  )
}

interface SortableTaskItemProps {
  task: TaskWithIncludes
  index: number
  group: number
  onClickSettings: (task: TaskWithIncludes) => void
}

function SortableTaskItem({
  task,
  index,
  group,
  onClickSettings,
}: SortableTaskItemProps) {
  const { ref, isDragging } = useSortable({
    id: task.taskSchedule.id,
    index,
    group: group.toString(),
    type: "task",
    accept: "task",
  })

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      <TaskItem task={task} onClickSettings={() => onClickSettings(task)} />
    </Box>
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
          showStats: false,
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
      <Stack
        sx={{
          paddingLeft: `28px`,
        }}
      >
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