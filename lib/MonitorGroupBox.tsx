import {
  Box,
  Collapse,
  Fade,
  fade,
  Grid,
  Hidden,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import makeStyles from "@material-ui/core/styles/makeStyles"
import DeleteIcon from "@material-ui/icons/Delete"
import clsx from "clsx"
import { Button, Tooltip } from "material-ui-bootstrap"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { useStorageState } from "react-storage-hooks"
import { useDeleteMonitorItem, useFetchMonitorItem } from "./api/api"
import { MonitorGroup } from "./api/MonitorResponse"
import ConfirmDialog from "./ConfirmDialog"
import { Details } from "./Details"
import { formatDuration, formatFromNow } from "./formatFromNow"
import { NoBr } from "./NoBr"
import { ProgressBar } from "./ProgressBar"
import { StatusIcon } from "./StatusIcon"
import { FAILED_COLOR, OK_COLOR } from "./theme"
import { Title } from "./Title"

const useStyles = makeStyles((theme) => ({
  groupBox: {
    "&.failed.closed": {
      backgroundColor: fade(FAILED_COLOR, 0.1),
    },
    marginBottom: theme.spacing(1),
    "&.open": {
      marginBottom: theme.spacing(4),
    },
  },
  row: {
    cursor: "pointer",
    "&.ok": {
      "& a": {
        color: OK_COLOR,
      },
      "&:hover": {
        backgroundColor: fade(OK_COLOR, 0.1),
      },
    },
    "&.failed": {
      "& a": {
        color: FAILED_COLOR,
      },
      "&:hover": {
        backgroundColor: fade(FAILED_COLOR, 0.2),
      },
      backgroundColor: fade(FAILED_COLOR, 0.1),
    },
  },
}))

interface Props {
  group: MonitorGroup
}

export function MonitorGroupBox(props: Props) {
  const classes = useStyles()
  const router = useRouter()

  // preload
  const [preload, setPreload] = useState<number | null>(null)
  useFetchMonitorItem(preload)

  const [open, setOpen] = useStorageState(
    sessionStorage,
    `MonitorGroup.open[${props.group.groupName}]`,
    false
  )

  const success =
    props.group.items.filter((x) => x.status !== "ok").length === 0

  const [showClearWarning, setShowClearWarning] = useState(false)

  const {
    mutateAsync: deleteMonitorItem,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteMonitorItem()

  async function handleClearAll() {
    setShowClearWarning(false)

    for (let i = 0; i < props.group.items.length; i++) {
      const item = props.group.items[i]
      await deleteMonitorItem({
        organizationId: item.pingSetup.organizationId,
        pingSetupId: item.pingSetup.id,
      })
    }
  }

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Fade key={props.group.groupName} in={true}>
      <Paper
        variant="outlined"
        style={{
          borderLeft: `4px solid ${success ? OK_COLOR : FAILED_COLOR}`,
        }}
        className={clsx(
          classes.groupBox,
          success ? "ok" : "failed",
          open ? "open" : "closed"
        )}
      >
        <Box padding={2} paddingLeft={1}>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Button onClick={() => setOpen(!open)}>
                <Grid container spacing={2} wrap="nowrap">
                  {!open && !isXsDown ? (
                    <Grid item>
                      <StatusIcon success={success} fontSize="large" />
                    </Grid>
                  ) : null}
                  <Grid item>
                    <Title label={<NoBr>{props.group.groupName}</NoBr>} />
                  </Grid>
                </Grid>
              </Button>
            </Grid>
            <Hidden xsDown>
              <Grid item>
                <Tooltip title="Clear Reports">
                  <IconButton onClick={() => setShowClearWarning(true)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <ConfirmDialog
                  message="Clear all the existing pings for this group of reports?"
                  open={showClearWarning}
                  onClose={() => setShowClearWarning(false)}
                  onAccept={handleClearAll}
                />
              </Grid>
            </Hidden>
          </Grid>
        </Box>

        <Collapse in={open}>
          <Table size="small">
            <Hidden mdDown>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Interval</TableCell>
                  <TableCell>Next Due</TableCell>
                  <TableCell>Last Success</TableCell>
                </TableRow>
              </TableHead>
            </Hidden>
            <TableBody>
              {props.group.items.map((item) => {
                const color = item.status === "ok" ? OK_COLOR : FAILED_COLOR
                const name = (
                  <>
                    <span
                      style={{
                        fontWeight: "bold",
                        color,
                      }}
                    >
                      {item.pingSetup.name}
                    </span>
                    {item.lastPing.tag !== null && item.lastPing.tag !== "" ? (
                      <div style={{ color }}>{item.lastPing.tag}</div>
                    ) : null}
                  </>
                )

                return (
                  <TableRow
                    key={item.pingSetup.id}
                    className={clsx(
                      item.status === "ok" ? "ok" : "failed",
                      classes.row
                    )}
                    onClick={() => router.push(`/pings/${item.pingSetup.id}`)}
                  >
                    <Hidden mdDown>
                      <TableCell>
                        <StatusIcon success={item.status === "ok"} />
                      </TableCell>
                      <TableCell>
                        <NoBr>{name}</NoBr>
                      </TableCell>
                    </Hidden>
                    <TableCell
                      onMouseOver={() => setPreload(item.pingSetup.id)}
                    >
                      <Hidden lgUp>
                        <NoBr>{name}</NoBr>
                      </Hidden>

                      {/* display details if it fits is single line and not em  */}
                      {item.lastPing.details !== null &&
                      item.lastPing.details !== "" &&
                      item.lastPing.details.split("\n").length === 1 ? (
                        <Box>
                          <Details details={item.lastPing.details} />
                        </Box>
                      ) : null}
                      <Box>
                        <ProgressBar
                          progress={item.lastPing.progressBar}
                          success={item.status === "ok"}
                          width={200}
                        />
                      </Box>
                    </TableCell>
                    <Hidden xsDown>
                      <TableCell>
                        <NoBr>
                          every {formatDuration(item.lastPing.interval * 60000)}
                        </NoBr>
                      </TableCell>
                      <TableCell>
                        <NoBr>{formatFromNow(item.nextDue)}</NoBr>
                      </TableCell>
                      <TableCell>
                        <NoBr>
                          {formatFromNow(item.lastSuccessfulPing.time)}
                        </NoBr>
                      </TableCell>
                    </Hidden>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Collapse>
      </Paper>
    </Fade>
  )
}
