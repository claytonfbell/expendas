import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

interface ReorderItems {
  items: { id: number; sortOrder: number }[]
}

export function useReorderTaskGroups() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, RestError, ReorderItems>({
    mutationFn: (params) =>
      rest.post(
        `/organizations/${organizationId}/tasks/groups/reorder`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_GROUPS, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASKS, organizationId],
      })
    },
  })
}
