import { useTheme } from "@mui/material"
import { useFetchTaskStats } from "./api/hooks/useFetchTaskStats"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"
import { StatBox } from "./StatBox"
import { StatBoxContainer } from "./StatBoxContainer"

export function TaskStats() {
  const { data: stats } = useFetchTaskStats()
  const theme = useTheme()

  if (stats.length === 0) {
    return null
  }

  return (
    <StatBoxContainer sx={{ paddingY: 2 }}>
      {stats.map((stat) => (
        <StatBox
          key={`${stat.groupName}-${stat.name}`}
          title={stat.name}
          titleColor={getHexColorForTaskGroupColor(
            stat.color,
            theme.palette.mode
          )}
          value={stat.completedCount}
          subtitle="Past 30 Days"
        />
      ))}
    </StatBoxContainer>
  )
}
