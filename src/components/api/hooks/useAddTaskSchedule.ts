import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskScheduleCreateRequest } from "../../../app/api/organizations.$id.tasks.schedules"
import type { TaskScheduleWithIncludes } from "../../../app/api/organizations.$id.tasks.schedules"

export function useAddTaskSchedule() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    TaskScheduleWithIncludes,
    RestError,
    TaskScheduleCreateRequest
  >({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/tasks/schedules`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_SCHEDULES, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASKS, organizationId],
      })
    },
  })
}