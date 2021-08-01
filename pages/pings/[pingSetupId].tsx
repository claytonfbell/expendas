import {
  Box,
  Breadcrumbs,
  Grid,
  Hidden,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import { formatDateTime } from "material-ui-pack"
import moment from "moment"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useDeleteMonitorItem, useFetchMonitorItem } from "../../lib/api/api"
import ConfirmDialog from "../../lib/ConfirmDialog"
import { Details } from "../../lib/Details"
import DisplayError from "../../lib/DisplayError"
import { formatDuration, formatFromNow } from "../../lib/formatFromNow"
import { Inside } from "../../lib/Inside"
import { Link } from "../../lib/Link"
import { PingChart } from "../../lib/PingChart"
import { ProgressBar } from "../../lib/ProgressBar"
import { StatusIcon } from "../../lib/StatusIcon"
import { FAILED_COLOR, OK_COLOR } from "../../lib/theme"
import { Title } from "../../lib/Title"

export default function Pings() {
  const router = useRouter()
  const pingSetupId = Number(router.query.pingSetupId)
  const { data, error: fetchError } = useFetchMonitorItem(pingSetupId)

  const title =
    data !== undefined
      ? `${data.monitorItem.pingSetup.groupName} / ${data.monitorItem.pingSetup.name}`
      : ""

  const [showClearWarning, setShowClearWarning] = useState(false)

  const {
    mutateAsync: deleteMonitorItem,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteMonitorItem()

  function handleClearAll() {
    if (data !== undefined) {
      deleteMonitorItem({
        organizationId: data.monitorItem.pingSetup.organizationId,
        pingSetupId,
      }).then(() => router.push(`/`))
      setShowClearWarning(false)
    }
  }

  const error = fetchError || deleteError

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  const success = data?.monitorItem.status === "ok"

  return (
    <Inside title={title}>
      <DisplayError error={error} />
      <Grid container justify="space-between">
        <Grid item>
          <Breadcrumbs>
            <Link href="/">Monitor</Link>
            <Typography>
              {data?.monitorItem.pingSetup.name || "Loading..."}
            </Typography>
          </Breadcrumbs>
        </Grid>
        <Hidden xsDown>
          <Grid item>
            <Button
              disabled={isDeleting}
              variant="outlined"
              color="danger"
              onClick={() => setShowClearWarning(true)}
            >
              Clear All
            </Button>
            <ConfirmDialog
              message="Clear all the existing pings for this report?"
              open={showClearWarning}
              onClose={() => setShowClearWarning(false)}
              onAccept={handleClearAll}
            />
          </Grid>
        </Hidden>
      </Grid>
      {data !== undefined ? (
        <Paper
          variant="outlined"
          style={{
            marginTop: 24,
            borderLeft: `4px solid ${success ? OK_COLOR : FAILED_COLOR}`,
          }}
        >
          <Box padding={2}>
            <Grid container spacing={3}>
              <Hidden xsDown>
                <Grid item>
                  <StatusIcon success={success} />
                </Grid>
              </Hidden>
              <Grid item>
                <div
                  style={{
                    color:
                      data.monitorItem.status === "ok"
                        ? OK_COLOR
                        : FAILED_COLOR,
                  }}
                >
                  <Typography
                    style={{
                      fontSize: isXsDown ? 21 : 28,
                    }}
                  >
                    Last Success{" "}
                    {formatFromNow(data.monitorItem.lastSuccessfulPing.time)}
                  </Typography>
                  <Typography>
                    Next ping due {formatFromNow(data.monitorItem.nextDue)}
                  </Typography>
                  <Typography>
                    Ping expected every{" "}
                    {formatDuration(data.monitorItem.lastPing.interval * 60000)}
                  </Typography>
                  {data.monitorItem.pingSetup.emails.length > 0 ? (
                    <Typography>
                      Recpiients: {data.monitorItem.pingSetup.emails.join(", ")}
                    </Typography>
                  ) : null}
                </div>
                <Hidden xsDown>
                  {data.monitorItem.lastPing.progressBar !== null ? (
                    <PingChart
                      color={
                        data.monitorItem.status === "ok"
                          ? OK_COLOR
                          : FAILED_COLOR
                      }
                      data={[...data.pings].reverse().map((ping) => ({
                        time: moment(ping.time).format("h:mm"),
                        progressBar: ping.progressBar || 0,
                      }))}
                    />
                  ) : null}
                </Hidden>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      ) : null}

      <br />
      <br />
      <Title label={title} />
      <Typography>{data?.monitorItem.lastPing.tag}</Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        style={{ marginTop: 24 }}
      >
        <Table size="small">
          <Hidden xsDown>
            <TableHead>
              <Hidden mdDown>
                <TableCell>Status</TableCell>
                <TableCell>Tag</TableCell>
                <TableCell></TableCell>
              </Hidden>
              <TableCell>Details</TableCell>
              <TableCell>Time</TableCell>
            </TableHead>
          </Hidden>

          <TableBody>
            {(data?.pings || []).map((ping) => {
              const time = (
                <>
                  <div>{formatDateTime(moment(ping.time).toISOString())}</div>
                  <div>{formatFromNow(ping.time)}</div>
                </>
              )
              const progressBar = (
                <ProgressBar
                  width={200}
                  progress={ping.progressBar}
                  success={ping.success}
                />
              )

              return (
                <TableRow
                  key={ping.id}
                  style={{
                    borderLeft: `4px solid ${
                      ping.success ? OK_COLOR : FAILED_COLOR
                    }`,
                  }}
                >
                  <Hidden mdDown>
                    <TableCell>
                      <StatusIcon success={ping.success} />
                    </TableCell>
                    <TableCell>{ping.tag}</TableCell>
                    <TableCell>{progressBar}</TableCell>
                  </Hidden>
                  <TableCell>
                    <Hidden lgUp>{ping.tag}</Hidden>
                    <Hidden lgUp>{progressBar}</Hidden>
                    <Details details={ping.details} />
                    <Hidden smUp>{time}</Hidden>
                  </TableCell>
                  <Hidden xsDown>
                    <TableCell>{time}</TableCell>
                  </Hidden>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Inside>
  )
}
