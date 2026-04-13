import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import {
  Box,
  IconButton,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { TaskScheduleWithIncludes } from "../pages/api/organizations/[id]/tasks/schedules"
import { useFetchTaskSchedules, useRemoveTaskSchedule } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import { ExpendasTable } from "./ExpendasTable"
import { TaskGroupChip } from "./TaskGroupChip"
import { TaskScheduleCreateDialog } from "./TaskScheduleCreateDialog"
import {
  displayTaskScheduleRepeatsSummary,
  TaskScheduleEditDialog,
} from "./TaskScheduleEditDialog"

export function TaskSchedules() {
  const { data: taskSchedules } = useFetchTaskSchedules()
  const { mutateAsync: removeTaskSchedule } = useRemoveTaskSchedule()

  const [taskSchedule, setTaskSchedule] =
    useState<TaskScheduleWithIncludes | null>(null)
  const [confirmDelete, setConfirmDelete] =
    useState<TaskScheduleWithIncludes | null>(null)

  return (
    <>
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h1">Task Schedules</Typography>
          <TaskScheduleCreateDialog
            onCreate={(newTaskSchedule) => setTaskSchedule(newTaskSchedule)}
          />
        </Stack>

        <ExpendasTable>
          <TableHead>
            <TableRow>
              <TableCell>Task Group</TableCell>
              <TableCell>Schedule Name</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell align="right">Edit / Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskSchedules &&
              taskSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <TaskGroupChip taskGroup={schedule.taskGroup} />
                  </TableCell>
                  <TableCell>{schedule.name}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        "& p, & ul": {
                          margin: 0,
                          padding: 0,
                        },
                        // hide bullet points from markdown
                        "& li": {
                          listStyleType: "none",
                        },
                      }}
                    >
                      <ReactMarkdown>
                        {displayTaskScheduleRepeatsSummary(schedule)}
                      </ReactMarkdown>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <IconButton
                        size="small"
                        onClick={() => setTaskSchedule(schedule)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setConfirmDelete(schedule)}
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

      <TaskScheduleEditDialog
        taskSchedule={taskSchedule}
        onClose={() => setTaskSchedule(null)}
      />

      <ConfirmDialog
        message="Are you sure you want to delete?"
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onAccept={() => {
          if (!confirmDelete) return
          removeTaskSchedule(confirmDelete.id)
          setConfirmDelete(null)
        }}
      />
    </>
  )
}
