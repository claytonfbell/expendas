import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskGroupCreateRequest } from "../../../app/api/organizations.$id.tasks.groups"
import type { TaskGroupWithIncludes } from "../../../app/api/organizations.$id.tasks.groups.$taskGroupId"

export function useAddTaskGroup() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<TaskGroupWithIncludes, RestError, TaskGroupCreateRequest>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/tasks/groups`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASK_GROUPS, organizationId],
      })
    },
  })
}