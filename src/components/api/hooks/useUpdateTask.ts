import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskWithIncludes } from "../../../app/api/organizations.$id.tasks"

export function useUpdateTask() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<TaskWithIncludes, RestError, TaskWithIncludes>({
    mutationFn: (params) =>
      rest.put(`/organizations/${organizationId}/tasks/${params.id}`, params),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TASKS, organizationId],
      })
    },
  })
}
