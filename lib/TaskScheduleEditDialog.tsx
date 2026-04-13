import {
  Alert,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import {
  CheckboxBase,
  DatePickerBase,
  MultipleDatePicker,
  SelectBase,
} from "material-ui-pack"
import moment from "moment"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { TaskScheduleWithIncludes } from "../pages/api/organizations/[id]/tasks/schedules"
import {
  useFetchTaskGroups,
  useRemoveTaskSchedule,
  useUpdateTaskSchedule,
} from "./api/api"
import ConfirmDialog from "./ConfirmDialog"

interface Props {
  taskSchedule: TaskScheduleWithIncludes | null
  onClose: () => void
}

export function TaskScheduleEditDialog({ taskSchedule, onClose }: Props) {
  const { mutateAsync: updateTaskSchedule } = useUpdateTaskSchedule()
  const { mutateAsync: removeTaskSchedule } = useRemoveTaskSchedule()
  const { data: taskGroups } = useFetchTaskGroups()

  const [state, setState] = useState<TaskScheduleWithIncludes | null>(null)
  useEffect(() => {
    setState(taskSchedule)
  }, [taskSchedule])

  function handleUpdate(updatedFields: Partial<TaskScheduleWithIncludes>) {
    setState((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        ...updatedFields,
      }
    })
  }

  const [openAdditionalDates, setOpenAdditionalDates] = useState(false)

  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <Dialog
        open={taskSchedule !== null}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Update Task Schedule</DialogTitle>
        <DialogContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!state) return
              await updateTaskSchedule(state)
              onClose()
            }}
          >
            {state !== null && (
              <Stack spacing={1} marginTop={1}>
                <SelectBase
                  size="small"
                  label="Group"
                  options={(taskGroups ?? []).map((group) => ({
                    label: group.name,
                    value: group.id,
                  }))}
                  value={state.taskGroupId}
                  onChange={(taskGroupId) =>
                    handleUpdate({ taskGroupId: taskGroupId as number })
                  }
                />

                <TextField
                  size="small"
                  label="Name"
                  value={state.name}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                />

                <DatePickerBase
                  size="small"
                  label="Date"
                  value={state.date}
                  onChange={(date) =>
                    handleUpdate({
                      date: date ?? moment().format("YYYY-MM-DD"),
                    })
                  }
                />

                <TextField
                  size="small"
                  multiline
                  minRows={3}
                  label="Description"
                  value={state.description ?? ""}
                  onChange={(e) =>
                    handleUpdate({
                      description:
                        e.target.value === "" ? null : e.target.value,
                    })
                  }
                />

                <CheckboxBase
                  label="Auto Close Tasks"
                  value={state.autoClose}
                  onChange={(autoClose) => handleUpdate({ autoClose })}
                />

                <CheckboxBase
                  label="Repeats"
                  value={state.repeats}
                  onChange={(repeats) => handleUpdate({ repeats })}
                />

                <Collapse in={state.repeats} unmountOnExit>
                  <Stack spacing={2}>
                    <DatePickerBase
                      size="small"
                      label="Repeats Until"
                      value={state.repeatsUntilDate}
                      onChange={(date) =>
                        handleUpdate({ repeatsUntilDate: date })
                      }
                    />

                    {/* repeatsOnDaysOfWeek  */}
                    <Stack>
                      <CheckboxBase
                        label="Only on specific days of the week"
                        value={state.repeatsOnDaysOfWeek.length > 0}
                        onChange={(checked) => {
                          handleUpdate({
                            repeatsOnDaysOfWeek: checked
                              ? [moment(`${state.date} 00:00:00`).day()]
                              : [],
                          })
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={0}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        {state.repeatsOnDaysOfWeek.length > 0 &&
                          [
                            { label: "Sun", value: 0 },
                            { label: "Mon", value: 1 },
                            { label: "Tue", value: 2 },
                            { label: "Wed", value: 3 },
                            { label: "Thu", value: 4 },
                            { label: "Fri", value: 5 },
                            { label: "Sat", value: 6 },
                          ].map((day) => (
                            <CheckboxBase
                              key={day.value}
                              label={day.label}
                              value={state.repeatsOnDaysOfWeek.includes(
                                day.value
                              )}
                              onChange={(checked) => {
                                const newDaysOfWeek = checked
                                  ? [...state.repeatsOnDaysOfWeek, day.value]
                                  : state.repeatsOnDaysOfWeek.filter(
                                      (d) => d !== day.value
                                    )
                                handleUpdate({
                                  repeatsOnDaysOfWeek: newDaysOfWeek,
                                })
                              }}
                            />
                          ))}
                      </Stack>
                    </Stack>

                    {/* repeatsOnDaysOfMonth */}
                    <Stack>
                      <CheckboxBase
                        label="Only on specific days of the month"
                        value={state.repeatsOnDaysOfMonth.length > 0}
                        onChange={(checked) => {
                          handleUpdate({
                            repeatsOnDaysOfMonth: checked
                              ? [moment(`${state.date} 00:00:00`).date()]
                              : [],
                          })
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={0}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        {state.repeatsOnDaysOfMonth.length > 0 &&
                          Array.from({ length: 31 }, (_, i) => i + 1).map(
                            (day) => (
                              <CheckboxBase
                                key={day}
                                label={day.toString()}
                                value={state.repeatsOnDaysOfMonth.includes(day)}
                                onChange={(checked) => {
                                  const newDaysOfMonth = checked
                                    ? [...state.repeatsOnDaysOfMonth, day]
                                    : state.repeatsOnDaysOfMonth.filter(
                                        (d) => d !== day
                                      )
                                  handleUpdate({
                                    repeatsOnDaysOfMonth: newDaysOfMonth,
                                  })
                                }}
                              />
                            )
                          )}
                      </Stack>
                    </Stack>

                    {/* repeatsOnMonthsOfYear */}
                    <Stack>
                      <CheckboxBase
                        label="Only on specific months of the year"
                        value={state.repeatsOnMonthsOfYear.length > 0}
                        onChange={(checked) => {
                          handleUpdate({
                            repeatsOnMonthsOfYear: checked
                              ? [moment(`${state.date} 00:00:00`).month()]
                              : [],
                          })
                        }}
                      />
                      <Stack
                        direction="row"
                        spacing={0}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        {state.repeatsOnMonthsOfYear.length > 0 &&
                          Array.from({ length: 12 }, (_, i) => i).map(
                            (month) => (
                              <CheckboxBase
                                key={month}
                                label={moment().month(month).format("MMM")}
                                value={state.repeatsOnMonthsOfYear.includes(
                                  month
                                )}
                                onChange={(checked) => {
                                  const newMonthsOfYear = checked
                                    ? [...state.repeatsOnMonthsOfYear, month]
                                    : state.repeatsOnMonthsOfYear.filter(
                                        (m) => m !== month
                                      )
                                  handleUpdate({
                                    repeatsOnMonthsOfYear: newMonthsOfYear,
                                  })
                                }}
                              />
                            )
                          )}
                      </Stack>
                    </Stack>

                    {/* repeatsWeekly */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SelectBase
                        size="small"
                        label="Skip Weeks"
                        allowNull
                        nullLabel="Any Week"
                        options={[
                          { label: "Every 2 Weeks", value: 2 },
                          { label: "Every 3 Weeks", value: 3 },
                          { label: "Every 4 Weeks", value: 4 },
                          { label: "Every 5 Weeks", value: 5 },
                          { label: "Every 6 Weeks", value: 6 },
                          { label: "Every 7 Weeks", value: 7 },
                          { label: "Every 8 Weeks", value: 8 },
                          { label: "Every 9 Weeks", value: 9 },
                          { label: "Every 10 Weeks", value: 10 },
                          { label: "Every 11 Weeks", value: 11 },
                          { label: "Every 12 Weeks", value: 12 },
                          { label: "Every 13 Weeks", value: 13 },
                        ]}
                        value={state.repeatsWeekly ?? ""}
                        onChange={(repeatsWeekly) =>
                          handleUpdate({
                            repeatsWeekly:
                              repeatsWeekly === ""
                                ? null
                                : (repeatsWeekly as number),
                          })
                        }
                      />
                    </Stack>

                    {/* repeatsOnDates */}
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => setOpenAdditionalDates(true)}
                      >
                        Additional Dates...
                      </Button>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                      >
                        {state.repeatsOnDates.map((date) => (
                          <Chip
                            sx={{ marginBottom: 1 }}
                            key={date}
                            size="small"
                            label={moment(`${date} 00:00:00`).format("l")}
                            onDelete={() => {
                              handleUpdate({
                                repeatsOnDates: state.repeatsOnDates.filter(
                                  (d) => d !== date
                                ),
                              })
                            }}
                          />
                        ))}
                      </Stack>
                      <MultipleDatePicker
                        dates={state.repeatsOnDates}
                        onChange={(dates) =>
                          handleUpdate({ repeatsOnDates: dates })
                        }
                        open={openAdditionalDates}
                        onClose={() => setOpenAdditionalDates(false)}
                      />
                    </Stack>
                  </Stack>
                </Collapse>

                {/* summary */}
                <Alert icon={false} severity="info">
                  <ReactMarkdown>
                    {displayTaskScheduleRepeatsSummary(state)}
                  </ReactMarkdown>
                </Alert>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit">
                    Save
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setConfirm(true)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            )}
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        message="Are you sure you want to delete schedule?"
        onAccept={() => {
          if (!state) return
          removeTaskSchedule(state.id)
          setConfirm(false)
          onClose()
        }}
      />
    </>
  )
}

export function displayTaskScheduleRepeatsSummary({
  date,
  repeats,
  repeatsUntilDate,
  repeatsOnDaysOfWeek,
  repeatsOnDaysOfMonth,
  repeatsOnMonthsOfYear,
  repeatsWeekly,
  repeatsOnDates,
}: TaskScheduleWithIncludes) {
  if (!repeats) {
    return moment(`${date} 00:00:00`).format("dddd - LL")
  }
  const parts: string[] = []
  if (
    repeatsOnDaysOfWeek.length === 0 &&
    repeatsOnDaysOfMonth.length === 0 &&
    repeatsOnMonthsOfYear.length === 0 &&
    repeatsWeekly === null
  ) {
    parts.push("Repeats daily after " + moment(`${date} 00:00:00`).format("LL"))
  } else {
    if (repeatsOnDaysOfWeek.length > 0) {
      parts.push(
        `Repeats on ${repeatsOnDaysOfWeek
          .map((d) => moment().day(d).format("dddd"))
          .join(", ")}`
      )
    }
    if (repeatsOnDaysOfMonth.length > 0) {
      parts.push(
        `Repeats on the ${repeatsOnDaysOfMonth
          .sort()
          .map((d) => {
            if (d === 1 || d === 21 || d === 31) return d + "st"
            if (d === 2 || d === 22) return d + "nd"
            if (d === 3 || d === 23) return d + "rd"
            return d + "th"
          })
          .join(", ")}`
      )
    }
    if (repeatsOnMonthsOfYear.length > 0) {
      parts.push(
        `Repeats in ${repeatsOnMonthsOfYear
          .sort()
          .map((m) => moment().month(m).format("MMMM"))
          .join(", ")}`
      )
    }
    if (repeatsWeekly !== null) {
      parts.push(`Repeats every ${repeatsWeekly} week(s)`)
    }
  }
  if (repeatsUntilDate !== null) {
    parts.push(
      `Stops repeating ${moment(`${repeatsUntilDate} 00:00:00`).format("LL")}`
    )
  }
  if (repeatsOnDates.length > 0) {
    parts.push(
      `Also: ${repeatsOnDates
        .sort()
        .map((d) => moment(`${d} 00:00:00`).format("LL"))
        .join(", ")}`
    )
  }
  if (parts.length > 1) {
    return parts.map((p) => `* ${p}`).join("\n")
  }
  return parts.join("\n")
}
