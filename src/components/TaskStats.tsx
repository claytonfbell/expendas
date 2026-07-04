import { Stack, useTheme } from "@mui/material"
import { useFetchTaskStats } from "./api/hooks/useFetchTaskStats"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"
import { StatBox } from "./StatBox"

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
        <StatBox
          key={`${stat.groupName}-${stat.name}`}
          title={stat.name}
          titleColor={getHexColorForTaskGroupColor(stat.color, theme.palette.mode)}
          value={stat.completedCount}
          subtitle="Past 30 Days"
        />
      ))}
    </Stack>
  )
}