import {
  Box,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import PieChartIcon from "@mui/icons-material/PieChart"
import DashboardIcon from "@mui/icons-material/Dashboard"
import { AccountBucket } from "@prisma/client"
import { useMemo, useState } from "react"
import {
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  Treemap,
} from "recharts"
import { displayAccountBucket } from "./accountBuckets"
import { AccountWithIncludes } from "./AccountWithIncludes"
import { formatMoney } from "./formatMoney"
import { getTickerDisplayName } from "./tickerDisplayNames"

type Props = {
  accounts: AccountWithIncludes[]
}

export function InvestmentAssetBreakdown({ accounts }: Props) {
  const [groupBy, setGroupBy] = useState<"assetType" | "accountType">(
    "assetType"
  )
  const [chartType, setChartType] = useState<"treemap" | "pie">("pie")
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down("sm"))

  const treemapData = useMemo(() => {
    if (groupBy === "accountType") {
      const bucketAssets: Record<
        string,
        { name: string; size: number; group: string }[]
      > = {}

      accounts.forEach((account) => {
        const bucket = account.accountBucket || "After_Tax"
        if (!bucketAssets[bucket]) {
          bucketAssets[bucket] = []
        }
        account.assets.forEach((asset) => {
          const existing = bucketAssets[bucket].find(
            (a) => a.name === asset.ticker
          )
          if (existing) {
            existing.size += asset.balance
          } else {
            bucketAssets[bucket].push({
              name: asset.ticker,
              size: asset.balance,
              group: bucket,
            })
          }
        })
      })

      return Object.entries(bucketAssets)
        .sort((a, b) => {
          const order = ["Roth_And_HSA", "Traditional", "After_Tax"]
          return order.indexOf(a[0]) - order.indexOf(b[0])
        })
        .map(([bucket, children]) => ({
          name: displayAccountBucket(bucket as AccountBucket),
          children: children.sort((a, b) => b.size - a.size),
        }))
    }

    const equityAssets: Record<string, number> = {}
    const fixedIncomeAssets: Record<string, number> = {}

    accounts.forEach((account) => {
      account.assets.forEach((asset) => {
        const target =
          asset.assetType === "Equity" ? equityAssets : fixedIncomeAssets
        target[asset.ticker] = (target[asset.ticker] || 0) + asset.balance
      })
    })

    const children: {
      name: string
      children: { name: string; size: number }[]
    }[] = []

    const eqChildren = Object.entries(equityAssets)
      .sort((a, b) => b[1] - a[1])
      .map(([ticker, balance]) => ({
        name: ticker,
        size: balance,
        group: "Equity",
      }))
    if (eqChildren.length > 0) {
      children.push({ name: "Equity", children: eqChildren })
    }

    const fiChildren = Object.entries(fixedIncomeAssets)
      .sort((a, b) => b[1] - a[1])
      .map(([ticker, balance]) => ({
        name: ticker,
        size: balance,
        group: "Fixed Income",
      }))
    if (fiChildren.length > 0) {
      children.push({ name: "Fixed Income", children: fiChildren })
    }

    return children
  }, [accounts, groupBy])

  const pieData = useMemo(() => {
    const flat: { name: string; value: number; group: string }[] = []
    treemapData.forEach((group) => {
      const children = (group as any).children as {
        name: string
        size: number
        group: string
      }[]
      children.forEach((child) => {
        flat.push({
          name: child.name,
          value: child.size,
          group: child.group,
        })
      })
    })
    return flat.sort((a, b) => b.value - a.value)
  }, [treemapData])

  const getGroupColor = (group: string) =>
    group === "Equity"
      ? theme.palette.primary.main
      : group === "Fixed Income"
        ? theme.palette.secondary.main
        : group === "Traditional"
          ? theme.palette.warning.main
          : group === "Roth_And_HSA"
            ? theme.palette.success.main
            : theme.palette.primary.main

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6">{isXs ? "Breakdown" : "Asset Breakdown"}</Typography>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            <IconButton
              size="small"
              aria-label="Pie chart view"
              onClick={() => setChartType("pie")}
              color={chartType === "pie" ? "primary" : "default"}
            >
              <PieChartIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Treemap view"
              onClick={() => setChartType("treemap")}
              color={chartType === "treemap" ? "primary" : "default"}
            >
              <DashboardIcon fontSize="small" />
            </IconButton>
          </Box>
          <Select
            value={groupBy}
            onChange={(e) =>
              setGroupBy(e.target.value as "assetType" | "accountType")
            }
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="assetType">Asset Type</MenuItem>
            <MenuItem value="accountType">Account Type</MenuItem>
          </Select>
        </Stack>
      </Stack>
      <ResponsiveContainer width="100%" height={320}>
        {chartType === "pie" ? (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={1}
              isAnimationActive={false}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getGroupColor(entry.group)}
                  stroke={theme.palette.divider}
                />
              ))}
            </Pie>
            <RechartTooltip
              formatter={(value: number) => formatMoney(value, true)}
              isAnimationActive={false}
            />
          </PieChart>
        ) : (
          <Treemap
            data={treemapData}
            dataKey="size"
            nameKey="name"
            aspectRatio={4 / 3}
            stroke={theme.palette.divider}
            fill={theme.palette.background.paper}
            isAnimationActive={false}
            content={<TreemapCustomContent />}
          >
            <RechartTooltip
              formatter={(value: number) => formatMoney(value, true)}
              isAnimationActive={false}
            />
          </Treemap>
        )}
      </ResponsiveContainer>
    </Stack>
  )
}

function TreemapCustomContent(props: any) {
  const theme = useTheme()
  const { depth, x, y, width, height, name } = props

  if (!width || !height) return null

  if (depth === 2) {
    const groupColor =
      props.group === "Equity"
        ? theme.palette.primary.main
        : props.group === "Fixed Income"
          ? theme.palette.secondary.main
          : props.group === "Traditional"
            ? theme.palette.warning.main
            : props.group === "Roth_And_HSA"
              ? theme.palette.success.main
              : theme.palette.primary.main
    const showLabel = width > 40 && height > 24
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={groupColor}
          stroke={theme.palette.divider}
          strokeWidth={1}
          rx={2}
        />
        {showLabel && (
          <text
            x={x + width / 2}
            y={y + height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#fff"
            fontSize={11}
            fontWeight={600}
          >
            {getTickerDisplayName(name)}
          </text>
        )}
      </g>
    )
  }

  return null
}
