import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Fade,
  Grid,
  LinearProgress,
  Stack,
  styled,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import dayjs, { Dayjs } from "./dayjs"
import React, { useMemo } from "react"
import { accountBuckets, displayAccountBucket } from "./accountBuckets"
import AnimatedCounter from "./AnimatedCounter"
import {
  useFetchAccounts,
  useFetchRetirementPlanReport,
  useFetchRetirementPlanUsers,
} from "./api/api"
import { BottomStatusBar } from "./BottomStatusBar"
import { ExpendasTable } from "./ExpendasTable"
import { formatMoney } from "./formatMoney"
import { NoBr } from "./NoBr"
import { RetirementPlanSection } from "./RetirementPlanSection"
import { ProjectionRow } from "./server/getRetirementPlanProjection"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanProjection({ retirementPlan }: Props) {
  const { data: report } = useFetchRetirementPlanReport(retirementPlan.id)

  const { data: users } = useFetchRetirementPlanUsers(retirementPlan.id)

  const fiDate = dayjs(report?.fiDate?.date)
  const fiFromNowString = fromNow(fiDate)
  const agesString = useMemo(
    () =>
      users
        ? users
            .map((user) =>
              dayjs(fiDate).diff(
                dayjs(`${user.user.dateOfBirth} 00:00:00`),
                "years"
              )
            )
            .join(" / ")
        : "",
    [users, fiDate]
  )

  const { data: accounts } = useFetchAccounts()
  const retirementAccounts = useMemo(
    () =>
      accounts
        ?.filter((x) => x.accountType === "Investment")
        .sort((a, b) =>
          a.accountBucket && b.accountBucket
            ? a.accountBucket.localeCompare(b.accountBucket)
            : 0
        ) ?? [],
    [accounts]
  )
  const savedSoFar = useMemo(() => {
    return retirementAccounts.reduce((sum, account) => {
      return sum + account.balance
    }, 0)
  }, [retirementAccounts])

  const [showDetails, setShowDetails] = React.useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [yearsOfBondsToHold, setYearsOfBondsToHold] = React.useState(7)

  return (
    <>
      <RetirementPlanSection
        title="Projection"
        summary={
          <>
            <Stack>
              {formatMoney(report?.fiDate.endingBalance ?? 0, true)}
            </Stack>
            <Stack>{fiDate.format("MMMM, YYYY")}</Stack>
            <Stack>{fiFromNowString}</Stack>
            <Stack>Ages: {agesString}</Stack>
            <Button variant="outlined" onClick={() => setShowDetails(true)}>
              More Details
            </Button>
          </>
        }
      >
        {report !== undefined && (
          <Stack spacing={2}>
            <Box
              sx={{
                position: "relative",
              }}
            >
              <LinearProgress
                color="primary"
                value={(savedSoFar / (report?.fiDate.endingBalance ?? 1)) * 100}
                variant="determinate"
                sx={{
                  height: 24,
                  borderRadius: 20,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  color: (theme) => theme.palette.primary.main,
                }}
              >
                {Math.round(
                  (savedSoFar / (report?.fiDate.endingBalance ?? 1)) * 100
                )}
                %
              </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
              <ExpendasTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Year</TableCell>
                    <TableCell align="center">Ages</TableCell>
                    <TableCell align="right">Starting Balance</TableCell>
                    <TableCell align="right">Appreciation</TableCell>
                    <TableCell align="right">Dividend</TableCell>
                    <TableCell align="right">+ / -</TableCell>
                    <TableCell align="right">Ending Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.projectionRows.map((row) => {
                    const startDate = dayjs(`${row.date} 00:00:00`)
                    const endDate = dayjs(`${row.date} 00:00:00`).add(
                      1,
                      "year"
                    )
                    const hilighted = fiDate.isBetween(
                      startDate,
                      endDate,
                      "day",
                      "[]"
                    )

                    return (
                      <TableRow key={row.date} selected={hilighted} hover>
                        <TableCell>
                          {dayjs(`${row.date} 00:00:00`).year()}
                        </TableCell>
                        <TableCell align="center">
                          <NoBr>
                            {users
                              ? users
                                  .map((user) => {
                                    return dayjs(`${row.date} 00:00:00`).diff(
                                      dayjs(
                                        `${user.user.dateOfBirth} 00:00:00`
                                      ),
                                      "years"
                                    )
                                  })
                                  .join(" / ")
                              : ""}
                          </NoBr>
                        </TableCell>
                        <TableCell align="right">
                          {formatMoney(row.startingBalance, true)}
                        </TableCell>
                        <TableCell align="right">
                          {formatMoney(row.appreciation, true)}
                        </TableCell>
                        <TableCell align="right">
                          {formatMoney(row.dividend, true)}
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              color: (theme) =>
                                row.contribution < 0
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                              // no wrapping
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatMoney(row.contribution, true)}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <EndingBalanceTooltip projectionRow={row}>
                            {formatMoney(row.endingBalance, true)}
                          </EndingBalanceTooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </ExpendasTable>
            </Box>
          </Stack>
        )}
      </RetirementPlanSection>
      <BottomStatusBar>
        <Stack
          direction="row"
          spacing={4}
          sx={{
            justifyContent: "end",
          }}
        >
          <Fade in={report?.fiDate !== undefined}>
            <Stack
              sx={{
                alignItems: "end",
              }}
            >
              <Typography>{fiFromNowString}</Typography>
              <Stack>{fiDate.format("MMMM, YYYY")}</Stack>
            </Stack>
          </Fade>
          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Typography>Financial Independence</Typography>
            <AnimatedCounter
              value={report?.fiDate.endingBalance ?? 0}
              roundNearestDollar
            />
          </Stack>
        </Stack>
      </BottomStatusBar>
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogContent>
          <Stack spacing={1}>
            <DetailItem label="Amount:">
              {formatMoney(
                (report?.fiDate.endingBalance ?? 0) -
                  (report?.selfFundedSocialSecurityAmount ?? 0) -
                  (report?.selfFundedHealthInsuranceAmount ?? 0),
                true
              )}
            </DetailItem>
            <DetailItem label="Self-Funded Health Insurance Amount:">
              {formatMoney(report?.selfFundedHealthInsuranceAmount ?? 0, true)}
            </DetailItem>
            <DetailItem label="Self-Funded Social Security Amount:">
              {formatMoney(report?.selfFundedSocialSecurityAmount ?? 0, true)}
            </DetailItem>

            <DetailItem label="Total Portfolio Amount at FI Date:">
              {formatMoney(report?.fiDate.endingBalance ?? 0, true)}
            </DetailItem>

            <DetailItem label="Total Self-Funded Term:">
              {fromDate(
                dayjs(report?.fiDate.date),
                dayjs(report?.fiDate.date).add(
                  report?.selfFundedTotalMonths ?? 0,
                  "months"
                )
              )}
            </DetailItem>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setShowDetails(false)}
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface DetailItemProps {
  label: React.ReactNode
  children: React.ReactNode
}

function DetailItem({ label, children }: DetailItemProps) {
  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Stack>{label}</Stack>
      <Stack>{children}</Stack>
    </Stack>
  )
}

export function fromNow(target: Dayjs) {
  const now = dayjs()
  return fromDate(now, target)
}

function fromDate(date1: Dayjs, date2: Dayjs) {
  const years = date2.diff(date1, "years")
  const months = date2.diff(date1, "months") % 12
  if (years >= 1) {
    return `${years} years, ${months} months`
  } else if (months >= 1) {
    return `${months} months`
  }
  return ""
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 220,
  },
})

interface EndingBalanceTooltipProps {
  projectionRow: ProjectionRow
  children: React.ReactNode
}

function EndingBalanceTooltip({
  projectionRow,
  children,
}: EndingBalanceTooltipProps) {
  return (
    <CustomWidthTooltip
      arrow
      title={
        <Grid container columns={2} spacing={0} sx={{ fontSize: 14 }}>
          {accountBuckets.map((accountBucket) => {
            const sum = projectionRow.accounts
              .filter((x) => x.accountBucket === accountBucket)
              .reduce((sum, account) => sum + account.endingBalance, 0)

            return (
              <React.Fragment key={accountBucket}>
                <Grid size={1}>{displayAccountBucket(accountBucket)}</Grid>
                <Grid size={1}>
                  <Stack
                    sx={{
                      alignItems: "end",
                    }}
                  >
                    {formatMoney(sum, true)}
                  </Stack>
                </Grid>
              </React.Fragment>
            )
          })}
        </Grid>
      }
    >
      <Stack>{children}</Stack>
    </CustomWidthTooltip>
  )
}
