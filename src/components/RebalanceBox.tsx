import {
  Alert,
  alpha,
  FormControlLabel,
  Stack,
  styled,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import dayjs from "dayjs"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { GlidePathRebalanceSchedule } from "./AssetAllocationGlidePath/GlidePathRebalanceSchedule"
import { formatMoney, formatPercentage } from "./formatMoney"

export type RebalanceAction = {
  label: string
  subtitle?: string
  amount: number
}

export type RebalanceBoxProps = {
  actions: RebalanceAction[]
  isWithinOnePercentOfTarget: boolean
  isOutsideTargetThreshold: boolean
  offTargetBy: number
  targetPortfolio: string
  nextRebalanceDate: dayjs.Dayjs
}

function buildBuySellMessage(actions: RebalanceAction[]): string {
  return actions
    .map((a) => {
      const action = a.amount > 0 ? "buy" : "sell"
      const subtitle = a.subtitle ? ` (${a.subtitle})` : ""
      return `- ${action} **${formatMoney(Math.abs(a.amount), true)}** of ${a.label}${subtitle}`
    })
    .join("\n")
}

function buildExchangeMessage(actions: RebalanceAction[]): string {
  const sources = actions
    .filter((a) => a.amount < 0)
    .map((a) => ({ label: a.label, remaining: Math.abs(a.amount) }))
  const destinations = actions
    .filter((a) => a.amount > 0)
    .map((a) => ({ label: a.label, remaining: a.amount }))

  const lines: string[] = []

  for (const dest of destinations) {
    let destRemaining = dest.remaining
    for (const source of sources) {
      if (destRemaining <= 0 || source.remaining <= 0) continue
      const exchangeAmount = Math.min(destRemaining, source.remaining)
      lines.push(
        `- exchange **${formatMoney(exchangeAmount, true)}** from ${source.label} to ${dest.label}`
      )
      destRemaining -= exchangeAmount
      source.remaining -= exchangeAmount
    }
    if (destRemaining > 0) {
      lines.push(`- buy **${formatMoney(destRemaining, true)}** of ${dest.label}`)
    }
  }

  for (const source of sources) {
    if (source.remaining > 0) {
      lines.push(
        `- exchange **${formatMoney(source.remaining, true)}** from ${source.label} to Cash`
      )
    }
  }

  return lines.join("\n")
}

export function RebalanceBox({
  actions,
  isWithinOnePercentOfTarget,
  isOutsideTargetThreshold,
  offTargetBy,
  targetPortfolio,
  nextRebalanceDate,
}: RebalanceBoxProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [showExchange, setShowExchange] = useState(false)

  const hasBothBuysAndSells =
    actions.some((a) => a.amount > 0) && actions.some((a) => a.amount < 0)

  const actionMessage = showExchange
    ? buildExchangeMessage(actions)
    : buildBuySellMessage(actions)

  let rebalanceMessage: string

  if (isWithinOnePercentOfTarget) {
    rebalanceMessage = `Your portfolio is only **${formatPercentage(offTargetBy, false)}** off your target allocation **${targetPortfolio}** stocks/bonds. You can skip rebalancing on the next rebalance date (${nextRebalanceDate.format("l")}) if you want.

${actionMessage}`
  } else if (!isOutsideTargetThreshold) {
    rebalanceMessage = actionMessage
  } else {
    rebalanceMessage = `Your portfolio is outside of your target allocation by **${formatPercentage(offTargetBy, false)}**. Consider rebalancing today.

${actionMessage}`
  }

  return (
    <CustomAlert
      severity={
        isWithinOnePercentOfTarget
          ? "success"
          : isOutsideTargetThreshold
            ? "warning"
            : "info"
      }
      variant="outlined"
      icon={isMobile ? false : undefined}
    >
      <Stack spacing={2}>
        <Typography
          component="div"
          sx={{
            "& p": {
              margin: 0,
            },
          }}
        >
          <ReactMarkdown>{rebalanceMessage}</ReactMarkdown>
        </Typography>
        {hasBothBuysAndSells && (
          <FormControlLabel
            control={
              <Switch
                checked={showExchange}
                onChange={(_, checked) => setShowExchange(checked)}
                size="small"
              />
            }
            label="Show Exchange Actions"
          />
        )}
        <GlidePathRebalanceSchedule />
      </Stack>
    </CustomAlert>
  )
}

const CustomAlert = styled(Alert)`
  background-color: ${(props) =>
    alpha(props.theme.palette[props.severity ?? "info"].light, 0.1)};
`
