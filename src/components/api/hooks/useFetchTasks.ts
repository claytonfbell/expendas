import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskWithIncludes } from "../../../app/api/organizations.$id.tasks"

export function useFetchTasks(startDate: string, endDate: string) {
  const { organizationId } = useGlobalState()
  return useQuery<TaskWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.TASKS, organizationId, startDate, endDate],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/tasks`, {
        startDate,
        endDate,
      }),
    enabled: organizationId !== null,
  })
}