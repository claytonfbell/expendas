import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { TaskGroupColor } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { TaskGroupCreateRequest } from "../pages/api/organizations/[id]/tasks/groups"
import { TaskGroupWithIncludes } from "../pages/api/organizations/[id]/tasks/groups/[taskGroupId]"
import { useAddTaskGroup } from "./api/api"
import DisplayError from "./DisplayError"

const defaultState: TaskGroupCreateRequest = {
  name: "",
  color: "Blue",
}

export const taskGroupColors: TaskGroupColor[] = [
  "Blue",
  "Green",
  "Red",
  "Yellow",
  "Purple",
  "Orange",
  "Gray",
]

interface Props {
  onCreate: (newTaskGroup: TaskGroupWithIncludes) => void
}

export function TaskGroupCreateDialog({ onCreate }: Props) {
  const { mutateAsync: addTaskGroup, error } = useAddTaskGroup()

  const [open, setOpen] = useState(false)
  const [state, setState] = useState<TaskGroupCreateRequest>(defaultState)
  useEffect(() => {
    if (!open) {
      setState(defaultState)
    }
  }, [open])

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create Task Group
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Create Task Group</DialogTitle>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const newTaskGroup = await addTaskGroup(state)
              setOpen(false)
              onCreate(newTaskGroup)
            }}
          >
            <Stack spacing={2} marginTop={1}>
              <DisplayError error={error} />
              <TextField
                size="small"
                label="Name"
                value={state.name}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <SelectBase
                size="small"
                label="Color"
                options={taskGroupColors.map((color) => ({
                  label: color,
                  value: color,
                }))}
                value={state.color}
                onChange={(color) =>
                  setState((prev) => ({
                    ...prev,
                    color: color as TaskGroupColor,
                  }))
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
