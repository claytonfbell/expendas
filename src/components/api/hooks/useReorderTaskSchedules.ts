import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

interface ReorderItems {
  items: { id: number; sortOrder: number }[]
}

export function useReorderTaskSchedules() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, RestError, ReorderItems>({
    mutationFn: (params) =>
      rest.post(
        `/organizations/${organizationId}/tasks/schedules/reorder`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_SCHEDULES, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASKS, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_GROUPS, organizationId],
      })
    },
  })
}
