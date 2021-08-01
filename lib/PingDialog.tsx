import {
  Dialog,
  DialogContent,
  Grid,
  Hidden,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { Button, Typography } from "material-ui-bootstrap"
import {
  Checkbox,
  Form,
  SubmitButton,
  TextField,
  TextFieldBase,
} from "material-ui-pack"
import React, { useEffect } from "react"
import { useStorageState } from "react-storage-hooks"
import { useCheckLogin, usePing } from "./api/api"
import { PingRequest } from "./api/PingRequest"
import DisplayError from "./DisplayError"

interface Props {
  defaultApiKey: string
  open: boolean
  onClose: () => void
}

const defaultState: PingRequest = {
  name: "CPU Usage",
  groupName: "Server 1",
  tag: "",
  details: "The server CPU usage is currently 29%.",
  interval: 5,
  apiKey: "",
  progressBar: 29,
  success: true,
  emails: null,
}

export function PingDialog(props: Props) {
  const [state, setState] = useStorageState<PingRequest>(
    sessionStorage,
    "PingDialog.state",
    defaultState
  )

  useEffect(() => {
    setState((prev) => ({ ...prev, apiKey: props.defaultApiKey }))
  }, [props.defaultApiKey, setState])

  const { mutateAsync: ping, isLoading, error } = usePing()

  function handleSubmit() {
    ping(state).then(() => {
      props.onClose()
    })
  }

  const [emailString, setEmailString] = useStorageState<string>(
    sessionStorage,
    "PingDialog.emailString",
    ""
  )
  useEffect(() => {
    const emails = emailString
      ?.trim()
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
    setState((prev) => ({ ...prev, emails: emails.length > 0 ? emails : null }))
  }, [emailString, setState])

  const numberFormatter = (v: string) => v.replace(/[^0-9]/g, "")

  const [intervalString, setIntervalString] = useStorageState(
    sessionStorage,
    "PingDialog.intervalString",
    "10"
  )
  useEffect(() => {
    const interval = intervalString !== "" ? Number(intervalString) : 0
    setState((prev) => ({ ...prev, interval }))
  }, [intervalString, setState])

  const [progressBarString, setProgressBarString] = useStorageState(
    sessionStorage,
    "PingDialog.progressBarString",
    "33"
  )
  useEffect(() => {
    const progressBar =
      progressBarString !== ""
        ? Math.max(0, Math.min(100, Number(progressBarString)))
        : null
    setState((prev) => ({ ...prev, progressBar }))
  }, [progressBarString, setState])

  const { data: loginResponse } = useCheckLogin()
  const userEmail = loginResponse?.user.email || null
  useEffect(() => {
    if (userEmail !== null) {
      setEmailString(userEmail)
    }
  }, [setEmailString, userEmail])

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        <Form
          state={state}
          setState={setState}
          onSubmit={handleSubmit}
          size="small"
          margin="none"
          busy={isLoading}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DisplayError error={error} />
            </Grid>

            <Grid item xs={12}>
              <TextField name="apiKey" autoComplete="off" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField name="groupName" autoComplete="off" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField name="name" autoComplete="off" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField name="tag" autoComplete="off" />
            </Grid>

            <Grid item xs={6} sm={4}>
              <Checkbox name="success" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextFieldBase
                disabled={isLoading}
                size="small"
                label="Interval (minutes)"
                value={intervalString}
                onChange={(v) => setIntervalString(numberFormatter(v))}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextFieldBase
                disabled={isLoading}
                size="small"
                label="Progress Bar (0-100)"
                value={progressBarString}
                onChange={(v) => setProgressBarString(numberFormatter(v))}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextFieldBase
                disabled={isLoading}
                label="Recipient Emails (comma separated)"
                size="small"
                value={emailString}
                onChange={(v) => setEmailString(v)}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField name="details" autoComplete="off" rows={3} multiline />
            </Grid>
            <Hidden xsDown>
              <Grid item xs={12}>
                <Typography style={{ fontSize: 12 }}>
                  <code>
                    POST{" "}
                    {`${window.location.protocol}//${window.location.host}/api/ping`}
                  </code>
                  <pre>{JSON.stringify(state, null, 2)}</pre>
                </Typography>
              </Grid>
            </Hidden>
            <Grid item xs={6}>
              <SubmitButton>Submit Ping</SubmitButton>
            </Grid>
            <Grid item xs={6}>
              <Button variant="outlined" onClick={props.onClose} fullWidth>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Form>
        <br />
      </DialogContent>
    </Dialog>
  )
}
