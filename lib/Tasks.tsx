import CloseIcon from "@mui/icons-material/Close"
import SettingsIcon from "@mui/icons-material/Settings"
import { ButtonBase, Container, Drawer, Fab, Stack } from "@mui/material"
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
        <Fab
          size="small"
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
          }}
          onClick={toggleDrawer(false)}
        >
          <CloseIcon />
        </Fab>

        <Container
          sx={{
            paddingBottom: 4,
          }}
        >
          <Stack alignItems={"center"} width="100%" paddingY={1}>
            <ButtonBase
              focusRipple
              sx={{
                backgroundColor: (theme) => theme.palette.divider,
                width: { xs: 40, sm: 80 },
                height: 8,
                borderRadius: 20,
              }}
              onClick={toggleDrawer(false)}
            ></ButtonBase>
          </Stack>

          <Stack spacing={2} paddingTop={4}>
            <TaskGroups />
            <TaskSchedules />
          </Stack>
        </Container>
      </Drawer>
    </Stack>
  )
}
