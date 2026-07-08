import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import type { SxProps, Theme } from "@mui/material"
import { useEffect, useState } from "react"
import { useChangePassword } from "./api/hooks/useChangePassword"
import { useFetchPreferences } from "./api/hooks/useFetchPreferences"
import { useUpdatePreferences } from "./api/hooks/useUpdatePreferences"
import { Title } from "./Title"

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label:
    i === 0
      ? "12 AM"
      : i < 12
        ? `${i} AM`
        : i === 12
          ? "12 PM"
          : `${i - 12} PM`,
}))

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

const styles: Record<string, SxProps<Theme>> = {
  section: {
    p: 3,
    mb: 3,
  },
  sectionTitle: {
    mb: 2,
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  formStack: {
    maxWidth: 400,
  },
}

export function Preferences() {
  const { data: preferences, isPending: isFetching } = useFetchPreferences()
  const { mutateAsync: updatePreferences, isPending: isUpdating, error: updateError } = useUpdatePreferences()
  const { mutateAsync: changePassword, isPending: isChangingPassword, error: changePasswordError } = useChangePassword()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [receiveDigestEmails, setReceiveDigestEmails] = useState(true)
  const [digestEmailTimes, setDigestEmailTimes] = useState<number[]>([6, 18])
  const [digestEmailDays, setDigestEmailDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (preferences) {
      setFirstName(preferences.user.firstName ?? "")
      setLastName(preferences.user.lastName ?? "")
      setReceiveDigestEmails(preferences.user.receiveDigestEmails)
      setDigestEmailTimes(preferences.user.digestEmailTimes)
      setDigestEmailDays(preferences.user.digestEmailDays)
    }
  }, [preferences])

  if (isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  function handleSaveProfile() {
    updatePreferences({ firstName, lastName })
  }

  function handleSaveNotifications() {
    updatePreferences({
      receiveDigestEmails,
      digestEmailTimes: receiveDigestEmails ? digestEmailTimes : [],
      digestEmailDays: receiveDigestEmails ? digestEmailDays : [],
    })
  }

  function handleChangePassword() {
    setPasswordSuccess(false)
    changePassword({ currentPassword, newPassword }).then(() => {
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
    })
  }

  return (
    <Stack spacing={3}>
      <Title label="Preferences" />

      <Paper sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Profile Information</Typography>
        <Stack spacing={2} sx={styles.formStack}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
          <Box>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Profile"}
            </Button>
            {updateError ? (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                {(updateError as any)?.message || "Failed to save"}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Change Password</Typography>
        <Stack spacing={2} sx={styles.formStack}>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
          />
          <Box>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={isChangingPassword || !currentPassword || !newPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
            {changePasswordError ? (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                {(changePasswordError as any)?.message || "Failed to change password"}
              </Typography>
            ) : null}
            {passwordSuccess ? (
              <Typography color="success.main" variant="caption" sx={{ ml: 2 }}>
                Password changed successfully
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Paper sx={styles.section}>
        <Typography sx={styles.sectionTitle}>Notification Settings</Typography>
        <Stack spacing={2} sx={styles.formStack}>
          <FormControlLabel
            control={
              <Switch
                checked={receiveDigestEmails}
                onChange={(e, checked) => setReceiveDigestEmails(checked)}
              />
            }
            label="Receive daily digest emails"
          />

          {receiveDigestEmails ? (
            <>
              <FormControl fullWidth>
                <InputLabel>Digest Email Times</InputLabel>
                <Select
                  multiple
                  value={digestEmailTimes}
                  onChange={(e) => setDigestEmailTimes(e.target.value as number[])}
                  renderValue={(selected) =>
                    selected
                      .sort((a, b) => a - b)
                      .map((h) => HOURS.find((x) => x.value === h)?.label ?? h)
                      .join(", ")
                  }
                >
                  {HOURS.map((hour) => (
                    <MenuItem key={hour.value} value={hour.value}>
                      <Checkbox checked={digestEmailTimes.indexOf(hour.value) > -1} />
                      <ListItemText primary={hour.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Digest Email Days</InputLabel>
                <Select
                  multiple
                  value={digestEmailDays}
                  onChange={(e) => setDigestEmailDays(e.target.value as number[])}
                  renderValue={(selected) =>
                    selected
                      .sort((a, b) => a - b)
                      .map((d) => DAYS.find((x) => x.value === d)?.label ?? d)
                      .join(", ")
                  }
                >
                  {DAYS.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      <Checkbox checked={digestEmailDays.indexOf(day.value) > -1} />
                      <ListItemText primary={day.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : null}

          <Box>
            <Button
              variant="contained"
              onClick={handleSaveNotifications}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Notification Settings"}
            </Button>
            {updateError ? (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                {(updateError as any)?.message || "Failed to save"}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  )
}