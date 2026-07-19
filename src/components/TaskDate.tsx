import TaskAltIcon from "@mui/icons-material/TaskAlt"
import { alpha, Box, Paper, Stack } from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"
import type { TaskWithIncludes } from "../app/api/organizations.$id.tasks"
import { useReorderTaskGroups } from "./api/hooks/useReorderTaskGroups"
import { BottomStatusBar } from "./BottomStatusBar"
import dayjs from "./dayjs"
import { TaskItemGroup } from "./TaskItemGroup"

interface Props {
  date: string
  tasks: TaskWithIncludes[]
}

export function TaskDate({ date, tasks }: Props) {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task.date === date)
  }, [tasks, date])

  const { mutateAsync: reorderGroups } = useReorderTaskGroups()

  const dateObject = dayjs(date, "YYYY-MM-DD")
  const isToday = dateObject.isSame(dayjs(), "day")

  const uniqueTaskGroups = useMemo(() => {
    const groupsMap: Record<string, TaskWithIncludes[]> = {}
    filteredTasks.forEach((task) => {
      const groupId = task.taskSchedule.taskGroup.id
      if (!groupsMap[groupId]) {
        groupsMap[groupId] = []
      }
      groupsMap[groupId].push(task)
    })
    return Object.values(groupsMap).sort(
      (a, b) =>
        a[0].taskSchedule.taskGroup.sortOrder -
        b[0].taskSchedule.taskGroup.sortOrder
    )
  }, [filteredTasks])

  const [orderedGroups, setOrderedGroups] = useState(uniqueTaskGroups)
  const orderedGroupsRef = useRef<TaskWithIncludes[][]>([])
  const prevDataKeyRef = useRef("")

  useEffect(() => {
    const dataKey = uniqueTaskGroups
      .flatMap((g) =>
        g[0]
          ? [
              g[0].taskSchedule.taskGroup.id +
                ":" +
                g[0].taskSchedule.taskGroup.sortOrder +
                "|" +
                g
                  .map(
                    (t) =>
                      t.id +
                      ":" +
                      t.taskSchedule.id +
                      ":" +
                      t.taskSchedule.sortOrder +
                      ":" +
                      t.taskSchedule.name +
                      ":" +
                      t.completed
                  )
                  .join(","),
            ]
          : []
      )
      .join(";")
    if (dataKey !== prevDataKeyRef.current) {
      prevDataKeyRef.current = dataKey
      setOrderedGroups(uniqueTaskGroups)
    }
  }, [uniqueTaskGroups])

  const allTasksCompleted = filteredTasks.every((task) => task.completed)
  const isInThePast = dateObject.isBefore(dayjs(), "day")

  const remainingTasks = useMemo(() => {
    if (isToday) {
      return filteredTasks.filter((task) => !task.completed).length
    }
    return 0
  }, [filteredTasks, isToday])

  const statusMessage = useMemo(() => {
    if (allTasksCompleted) {
      return "All tasks completed! Great job!"
    } else if (isToday && remainingTasks > 0) {
      return `You have ${remainingTasks} task${remainingTasks > 1 ? "s" : ""} remaining today.`
    } else if (isToday && remainingTasks === 0) {
      return "All tasks completed for today! Great job!"
    } else if (isInThePast) {
      return `You had ${filteredTasks.length} task${filteredTasks.length > 1 ? "s" : ""} on this day.`
    } else {
      return null
    }
  }, [
    allTasksCompleted,
    isToday,
    isInThePast,
    filteredTasks.length,
    remainingTasks,
  ])

  return (
    <Paper
      variant="outlined"
      sx={{
        paddingX: { xs: 2, xl: 1 },
        paddingY: 1,
        height: "100%",
        backgroundImage: (theme) => `repeating-linear-gradient(
              to bottom,
              ${theme.palette.background.paper},
              ${theme.palette.background.paper} 22px,
              ${alpha(theme.palette.divider, 0.06)} 23px,
              ${alpha(theme.palette.divider, 0.06)} 24px
            )`,

        position: "relative",
        outline: isInThePast
          ? (theme) => `2px dashed ${alpha(theme.palette.error.main, 0.5)}`
          : undefined,
      }}
    >
      <Stack
        spacing={1}
        sx={{
          alignItems: "end",
          position: "absolute",
          right: 12,
          top: 12,
        }}
      >
        <Stack
          sx={{
            alignItems: "end",

            color: (theme) =>
              allTasksCompleted
                ? "success.light"
                : isToday
                  ? "primary.light"
                  : isInThePast
                    ? "error.light"
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
      <DragDropProvider
        onDragStart={() => {
          orderedGroupsRef.current = [...orderedGroups]
        }}
        onDragEnd={(event) => {
          if (event.canceled) {
            setOrderedGroups(orderedGroupsRef.current)
            return
          }
          const { source } = event.operation
          if (isSortable(source)) {
            const { initialIndex, index } = source
            if (initialIndex === index) return
            const newGroups = [...orderedGroups]
            const [removed] = newGroups.splice(initialIndex, 1)
            newGroups.splice(index, 0, removed)
            setOrderedGroups(newGroups)
            reorderGroups({
              items: newGroups.map((groupTasks, i) => ({
                id: groupTasks[0].taskSchedule.taskGroup.id,
                sortOrder: i,
              })),
            })
          }
        }}
      >
        <Stack>
          {orderedGroups.map((groupTasks, index) => (
            <SortableGroup
              key={groupTasks[0].taskSchedule.taskGroup.id}
              groupTasks={groupTasks}
              index={index}
            />
          ))}
        </Stack>
      </DragDropProvider>
      {isToday && (
        <BottomStatusBar>
          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            {statusMessage}
          </Stack>
        </BottomStatusBar>
      )}
    </Paper>
  )
}

interface SortableGroupProps {
  groupTasks: TaskWithIncludes[]
  index: number
}

function SortableGroup({ groupTasks, index }: SortableGroupProps) {
  const { ref, isDragging } = useSortable({
    id: groupTasks[0].taskSchedule.taskGroup.id,
    index,
  })

  return (
    <Box
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      <TaskItemGroup groupTasks={groupTasks} />
    </Box>
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
