import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { TaskScheduleWithIncludes } from "../../../app/api/organizations.$id.tasks.schedules"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useUpdateTaskSchedule() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    TaskScheduleWithIncludes,
    RestError,
    TaskScheduleWithIncludes
  >({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/tasks/schedules/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_GROUPS, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_SCHEDULES, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASKS, organizationId],
      })
    },
  })
}
