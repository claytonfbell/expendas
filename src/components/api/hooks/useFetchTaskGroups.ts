import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskGroupWithIncludes } from "../../../app/api/organizations.$id.tasks.groups.$taskGroupId"

export function useFetchTaskGroups() {
  const { organizationId } = useGlobalState()
  return useQuery<TaskGroupWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.TASK_GROUPS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/tasks/groups`),
    enabled: organizationId !== null,
  })
}