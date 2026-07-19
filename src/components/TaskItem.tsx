import SettingsIcon from "@mui/icons-material/Settings"
import {
  alpha,
  Box,
  Checkbox,
  Fade,
  FormControlLabel,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material"
import { useEffect, useState } from "react"
import type { TaskWithIncludes } from "../app/api/organizations.$id.tasks"
import { useUpdateTask } from "./api/hooks/useUpdateTask"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"

interface TaskItemProps {
  task: TaskWithIncludes
  onClickSettings: (task: TaskWithIncludes) => void
}

export function TaskItem({ task, onClickSettings }: TaskItemProps) {
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
      onMouseEnter={() => setShowSettings(true)}
      onMouseLeave={() => setShowSettings(false)}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
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
