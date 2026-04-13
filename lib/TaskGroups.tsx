import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import {
  Chip,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { TaskGroupWithIncludes } from "../pages/api/organizations/[id]/tasks/groups/[taskGroupId]"
import { useFetchTaskGroups, useRemoveTaskGroup } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import { ExpendasTable } from "./ExpendasTable"
import { getHexColorForTaskGroupColor } from "./TaskGroupChip"
import { TaskGroupCreateDialog } from "./TaskGroupCreateDialog"
import { TaskGroupEditDialog } from "./TaskGroupEditDialog"

export function TaskGroups() {
  const { data: taskGroups } = useFetchTaskGroups()
  const { mutateAsync: removeTaskGroup } = useRemoveTaskGroup()

  const [taskGroup, setTaskGroup] = useState<TaskGroupWithIncludes | null>(null)
  const [confirmDelete, setConfirmDelete] =
    useState<TaskGroupWithIncludes | null>(null)

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h1">Task Groups</Typography>
          <TaskGroupCreateDialog
            onCreate={(newTaskGroup) => setTaskGroup(newTaskGroup)}
          />
        </Stack>

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Group Name</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Users</TableCell>
              <TableCell align="right">Edit / Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskGroups &&
              taskGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.name}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      sx={{
                        backgroundColor: getHexColorForTaskGroupColor(
                          group.color
                        ),
                        color: "white",
                      }}
                      label={group.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {group.users.map((u) => (
                        <Chip
                          key={u.id}
                          label={`${u.user.firstName} ${u.user.lastName}`}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        size="small"
                        onClick={() => setTaskGroup(group)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setConfirmDelete(group)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </ExpendasTable>
      </Stack>

      <TaskGroupEditDialog
        taskGroup={taskGroup}
        onClose={() => setTaskGroup(null)}
      />

      <ConfirmDialog
        message="Are you sure you want to delete?"
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onAccept={() => {
          if (!confirmDelete) return
          removeTaskGroup(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />
    </>
  )
}
