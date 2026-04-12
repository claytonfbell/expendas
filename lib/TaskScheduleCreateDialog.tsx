import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { SelectBase } from "material-ui-pack"
import moment from "moment"
import { useEffect, useState } from "react"
import {
  TaskScheduleCreateRequest,
  TaskScheduleWithIncludes,
} from "../pages/api/organizations/[id]/tasks/schedules"
import { useAddTaskSchedule, useFetchTaskGroups } from "./api/api"
import DisplayError from "./DisplayError"

const defaultState: TaskScheduleCreateRequest = {
  name: "",
  description: null,
  taskGroupId: null,
  date: moment().format("YYYY-MM-DD"),
  repeats: false,
  repeatsUntilDate: null,
  repeatsOnDaysOfWeek: [],
  repeatsOnDaysOfMonth: [],
  repeatsOnMonthsOfYear: [],
  repeatsWeekly: null,
  repeatsOnDates: [],
  autoClose: false,
}

interface Props {
  onCreate: (newTaskSchedule: TaskScheduleWithIncludes) => void
}

export function TaskScheduleCreateDialog({ onCreate }: Props) {
  const { mutateAsync: addTaskSchedule, error } = useAddTaskSchedule()
  const { data: taskGroups } = useFetchTaskGroups()

  const [open, setOpen] = useState(false)
  const [state, setState] = useState<TaskScheduleCreateRequest>(defaultState)
  useEffect(() => {
    if (!open) {
      setState(defaultState)
    }
  }, [open])

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create Task Schedule
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create Task Schedule</DialogTitle>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const newTaskSchedule = await addTaskSchedule(state)
              setOpen(false)
              onCreate(newTaskSchedule)
            }}
          >
            <Stack spacing={2} marginTop={1}>
              <DisplayError error={error} />
              <SelectBase
                size="small"
                label="Group"
                options={(taskGroups ?? []).map((group) => ({
                  label: group.name,
                  value: group.id,
                }))}
                value={state.taskGroupId}
                onChange={(taskGroupId) =>
                  setState((prev) => ({
                    ...prev,
                    taskGroupId: taskGroupId as number,
                  }))
                }
              />
              <TextField
                size="small"
                label="Name"
                value={state.name}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" type="submit">
                  Create
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
