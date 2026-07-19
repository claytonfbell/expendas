import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskGroupWithIncludes } from "../../../app/api/organizations.$id.tasks.groups.$taskGroupId"

export function useUpdateTaskGroup() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<TaskGroupWithIncludes, RestError, TaskGroupWithIncludes>({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/tasks/groups/${params.id}`,
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
