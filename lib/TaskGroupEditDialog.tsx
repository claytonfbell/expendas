import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { TaskGroupColor } from "@prisma/client"
import { CheckboxBase, SelectBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { TaskGroupWithIncludes } from "../pages/api/organizations/[id]/tasks/groups/[taskGroupId]"
import { useUpdateTaskGroup } from "./api/api"
import { useGlobalState } from "./GlobalStateProvider"
import { taskGroupColors } from "./TaskGroupCreateDialog"

interface Props {
  taskGroup: TaskGroupWithIncludes | null
  onClose: () => void
}

export function TaskGroupEditDialog({ taskGroup, onClose }: Props) {
  const { mutateAsync: updateTaskGroup } = useUpdateTaskGroup()

  const [state, setState] = useState<TaskGroupWithIncludes | null>(null)
  useEffect(() => {
    setState(taskGroup)
  }, [taskGroup])

  const { organization } = useGlobalState()

  return (
    <>
      <Dialog
        open={taskGroup !== null}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update Task Group</DialogTitle>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!state) return
              await updateTaskGroup(state)
              onClose()
            }}
          >
            {state !== null && (
              <Stack spacing={2} marginTop={1}>
                <TextField
                  size="small"
                  label="Name"
                  value={state.name}
                  onChange={(e) =>
                    setState((prev) => {
                      if (!prev) return prev
                      return {
                        ...prev,
                        name: e.target.value,
                      }
                    })
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
                    setState((prev) => {
                      if (!prev) return prev
                      return {
                        ...prev,
                        color: color as TaskGroupColor,
                      }
                    })
                  }
                />

                {organization &&
                  organization.users.map((organizationUser) => (
                    <CheckboxBase
                      label={`${organizationUser.user.firstName} ${organizationUser.user.lastName}`}
                      value={state.users.some(
                        (u) => u.userId === organizationUser.userId
                      )}
                      onChange={(checked) => {
                        setState((prev) => {
                          if (!prev) return prev

                          const newUsers: TaskGroupWithIncludes["users"] = [
                            ...prev.users,
                          ].filter((u) => {
                            if (u.userId === organizationUser.userId) {
                              return checked
                            }
                            return true
                          })
                          if (
                            checked &&
                            !prev.users.some(
                              (u) => u.userId === organizationUser.userId
                            )
                          ) {
                            newUsers.push({
                              userId: organizationUser.userId,
                              taskGroupId: taskGroup?.id,
                              user: organizationUser.user,
                            } as TaskGroupWithIncludes["users"][number])
                          }
                          return {
                            ...prev,
                            users: newUsers,
                          }
                        })
                      }}
                    />
                  ))}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit">
                    Save
                  </Button>
                </Stack>
              </Stack>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
