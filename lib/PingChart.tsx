import { Box, useMediaQuery, useTheme } from "@material-ui/core"
import React from "react"
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

export interface PingChartData {
  time: string
  progressBar: number
}

interface Props {
  data: PingChartData[]
  color: string
}

export function PingChart(props: Props) {
  const theme = useTheme()
  const isLg = useMediaQuery(theme.breakpoints.up("lg"))
  const isMd = useMediaQuery(theme.breakpoints.up("md"))
  const isSm = useMediaQuery(theme.breakpoints.up("sm"))

  const width = isLg ? 1104 : isMd ? 800 : isSm ? 430 : 410

  return (
    <Box marginTop={3}>
      <AreaChart
        width={width}
        height={250}
        data={props.data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={props.color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={props.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="progressBar"
          stroke={props.color}
          fillOpacity={1}
          fill="url(#colorPv)"
        />
      </AreaChart>
    </Box>
  )
}
