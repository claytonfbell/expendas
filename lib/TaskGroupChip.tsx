import { Chip } from "@mui/material"
import { TaskGroup, TaskGroupColor } from "@prisma/client"
import { adjustColorForAACompliance } from "./adjustColor"

interface Props {
  taskGroup: TaskGroup
}

export function TaskGroupChip({ taskGroup }: Props) {
  return (
    <Chip
      label={taskGroup.name}
      size="small"
      sx={{
        backgroundColor: (theme) =>
          getHexColorForTaskGroupColor(taskGroup.color, theme.palette.mode),
        color: "white",
      }}
    />
  )
}

export function getBaseColor(color: TaskGroupColor) {
  switch (color) {
    case "Blue":
      return "#1976d2"
    case "Green":
      return "#388e3c"
    case "Red":
      return "#d32f2f"
    case "Yellow":
      return "#d9c751"
    case "Purple":
      return "#7b1fa2"
    case "Orange":
      return "#f57c00"
    case "Gray":
      return "#616161"
    default:
      return "#1976d2" // default to blue if color is unrecognized
  }
}

export function getHexColorForTaskGroupColor(
  color: TaskGroupColor,
  mode: "light" | "dark"
) {
  const baseColor = getBaseColor(color)
  return adjustColorForAACompliance(baseColor, 3, mode)
}
