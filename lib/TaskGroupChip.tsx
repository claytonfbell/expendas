import { Chip } from "@mui/material"
import { TaskGroup, TaskGroupColor } from "@prisma/client"

interface Props {
  taskGroup: TaskGroup
}

export function TaskGroupChip({ taskGroup }: Props) {
  return (
    <Chip
      label={taskGroup.name}
      size="small"
      sx={{
        backgroundColor: getHexColorForTaskGroupColor(taskGroup.color),
        color: "white",
      }}
    />
  )
}

function getHexColorForTaskGroupColor(color: TaskGroupColor) {
  switch (color) {
    case "Blue":
      return "#1976d2"
    case "Green":
      return "#388e3c"
    case "Red":
      return "#d32f2f"
    case "Yellow":
      return "#fbc02d"
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
