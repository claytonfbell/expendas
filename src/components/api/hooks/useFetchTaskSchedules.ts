import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaskScheduleWithIncludes } from "../../../app/api/organizations.$id.tasks.schedules"

export function useFetchTaskSchedules() {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<TaskScheduleWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.TASK_SCHEDULES, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/tasks/schedules`),
  })
}
