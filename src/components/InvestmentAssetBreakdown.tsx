import { MenuItem, Select, Stack, Typography, useTheme } from "@mui/material"
import { AccountBucket } from "@prisma/client"
import { useMemo, useState } from "react"
import {
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
  const theme = useTheme()

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
        <Typography variant="h6">Asset Breakdown</Typography>
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
      <ResponsiveContainer width="100%" height={320}>
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
