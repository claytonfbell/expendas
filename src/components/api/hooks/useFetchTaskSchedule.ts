import { useQuery } from "@tanstack/react-query"
import type { TaskScheduleWithIncludes } from "../../../app/api/taskScheduleTypes"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchTaskSchedule(taskScheduleId: number | null) {
  const { organizationId } = useGlobalState()
  return useQuery<TaskScheduleWithIncludes, RestError>({
    enabled: taskScheduleId !== null,
    queryKey: [QUERY_KEYS.TASK_SCHEDULES, organizationId, taskScheduleId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId}/tasks/schedules/${taskScheduleId}`
      ),
  })
}
