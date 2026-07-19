import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveTaskSchedule() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (taskScheduleId) =>
      rest.delete(
        `/organizations/${organizationId}/tasks/schedules/${taskScheduleId}`
      ),
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
