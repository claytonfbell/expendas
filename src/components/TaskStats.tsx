import { Stack, Typography, useTheme } from "@mui/material"
import { useFetchTaskStats } from "./api/hooks/useFetchTaskStats"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"

export function TaskStats() {
  const { data: stats } = useFetchTaskStats()
  const theme = useTheme()

  if (stats.length === 0) {
    return null
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        flexWrap: "wrap",
        paddingY: 2,
      }}
      useFlexGap
    >
      {stats.map((stat) => (
        <Stack
          key={`${stat.groupName}-${stat.name}`}
          sx={{
            flex: 1,
            minWidth: 120,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            padding: 2,
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: getHexColorForTaskGroupColor(
                stat.color,
                theme.palette.mode
              ),
              fontWeight: "bold",
            }}
          >
            {stat.name}
          </Typography>
          <Typography variant="h4">{stat.completedCount}</Typography>
          <Typography variant="body2" color="text.secondary">
            Past 30 Days
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}
