import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Box,
  Button,
  Collapse,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import dayjs from "dayjs"
import { useMemo, useState } from "react"
import { ExpendasTable } from "./ExpendasTable"
import { getTargetEquityPercentageWithGlidePaths } from "./glidePaths"

export function GlidePathRebalanceSchedule() {
  const allRebalanceDates = useMemo(() => {
    const firstRebalanceDate = dayjs("2026-09-22")
    const rebalanceFrequencyMonths = 3
    const numberOfYears = 30
    const dates = []
    for (let i = 0; i < (numberOfYears * 12) / rebalanceFrequencyMonths; i++) {
      dates.push(firstRebalanceDate.add(i * rebalanceFrequencyMonths, "month"))
    }
    return dates
  }, [])

  const [show, setShow] = useState(false)

  return (
    <Stack spacing={2} sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}>
      <Button
        color="inherit"
        variant="contained"
        onClick={() => setShow((prev) => !prev)}
        startIcon={
          <ExpandMoreIcon
            sx={{
              transform: show ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          />
        }
      >
        {show ? "Hide Rebalance Schedule" : "Show Rebalance Schedule"}
      </Button>
      <Collapse in={show}>
        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell colSpan={2}>Stocks / Bonds</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allRebalanceDates.map((date) => {
              const targetEquityPercentage =
                getTargetEquityPercentageWithGlidePaths(date)

              return (
                <TableRow key={date.toString()}>
                  <TableCell>{date.format("l")}</TableCell>
                  <TableCell>
                    {Math.round(targetEquityPercentage * 100)}% /{" "}
                    {Math.round((1 - targetEquityPercentage) * 100)}%
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0}
                      sx={{
                        borderRadius: 1,
                        overflow: "hidden",
                        width: { xs: 100, sm: 200, md: 300, lg: 400 },
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.primary.main,
                          width: `${targetEquityPercentage * 100}%`,
                          height: 20,
                        }}
                      ></Box>
                      <Box
                        sx={{
                          backgroundColor: (theme) =>
                            theme.palette.secondary.main,
                          width: `${(1 - targetEquityPercentage) * 100}%`,
                          height: 20,
                        }}
                      ></Box>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </ExpendasTable>
      </Collapse>
    </Stack>
  )
}
