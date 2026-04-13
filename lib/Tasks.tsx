import SettingsIcon from "@mui/icons-material/Settings"
import { Container, Drawer, Fab, Stack } from "@mui/material"
import { useState } from "react"
import { TaskGroups } from "./TaskGroups"
import { TaskList } from "./TaskList"
import { TaskSchedules } from "./TaskSchedules"

export function Tasks() {
  const [open, setOpen] = useState(false)

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  return (
    <Stack>
      <Stack alignItems={"end"}>
        <Fab
          onClick={toggleDrawer(true)}
          size="small"
          color="primary"
          aria-label="settings"
        >
          <SettingsIcon />
        </Fab>
      </Stack>

      <TaskList />

      <Drawer open={open} onClose={toggleDrawer(false)} anchor="bottom">
        <Container
          sx={{
            paddingY: 4,
          }}
        >
          <Stack spacing={4}>
            <TaskGroups />
            <TaskSchedules />
          </Stack>
        </Container>
      </Drawer>
    </Stack>
  )
}
