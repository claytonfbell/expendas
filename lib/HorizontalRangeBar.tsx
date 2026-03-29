import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import { Divider, Stack, SvgIconProps, Typography } from "@mui/material"
import React from "react"
import { useMeasure } from "react-use"
import { formatMoney } from "./formatMoney"

interface Props {
  low: number
  current: number
  high: number
}

export function HorizontalRangeBar({ low, current, high }: Props) {
  const range = high - low
  const currentPosition = ((current - low) / range) * 100

  const [containerRef, { width: containerWidth }] = useMeasure<HTMLDivElement>()
  const [lowRef, { width: lowWidth }] = useMeasure<HTMLDivElement>()
  const [currentRef, { width: currentWidth }] = useMeasure<HTMLDivElement>()
  const [highRef, { width: highWidth }] = useMeasure<HTMLDivElement>()

  const currentPositionInPixels =
    (currentPosition / 100) * containerWidth - currentWidth / 2

  const highColision =
    currentPositionInPixels + currentWidth > containerWidth - highWidth
  const lowColision = currentPositionInPixels < lowWidth

  return (
    <>
      <Stack
        ref={containerRef}
        direction="row"
        alignItems="start"
        position={"relative"}
        justifyContent={"space-between"}
      >
        <Divider
          sx={{
            position: "absolute",
            width: containerWidth,
            top: 3,
            borderBottomWidth: 24,
            borderRadius: 6,
          }}
        />

        <HorizontalRangeBarIndicator
          containerRef={lowRef}
          align="start"
          value={low}
          color="error"
          label="2 Year Low"
          Icon={ArrowDropDownIcon}
          collides={false}
        />

        <HorizontalRangeBarIndicator
          containerRef={currentRef}
          align="center"
          left={currentPositionInPixels}
          value={current}
          color="primary"
          label="Current"
          Icon={FiberManualRecordIcon}
          collides={lowColision}
        />

        <HorizontalRangeBarIndicator
          containerRef={highRef}
          align="end"
          value={high}
          color="success"
          label="All Time High"
          Icon={ArrowDropUpIcon}
          collides={highColision}
        />
      </Stack>
    </>
  )
}

interface HorizontalRangeBarIndicatorProps {
  left?: number
  value: number
  color: "error" | "success" | "primary"
  label: string
  Icon: React.ElementType<SvgIconProps>
  align: "start" | "end" | "center"
  containerRef: React.Ref<HTMLDivElement>
  collides: boolean
}

function HorizontalRangeBarIndicator({
  left,
  value,
  color,
  label,
  Icon,
  align,
  containerRef,
  collides,
}: HorizontalRangeBarIndicatorProps) {
  return (
    <Stack
      ref={containerRef}
      left={left}
      position={left ? "absolute" : undefined}
      alignItems={align}
    >
      <Icon color={color} fontSize="large" />
      <Stack marginTop={collides ? 5 : 0} alignItems={align}>
        <Typography
          fontWeight={"bold"}
          sx={{ color: (theme) => theme.palette[color].main }}
        >
          {formatMoney(value)}
        </Typography>
        <Typography
          fontWeight={"bold"}
          sx={{ color: (theme) => theme.palette[color].main }}
        >
          {label}
        </Typography>
      </Stack>
    </Stack>
  )
}
