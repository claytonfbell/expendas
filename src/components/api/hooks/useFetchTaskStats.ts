import type { TaskGroupColor } from "@prisma/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

interface TaskStat {
  name: string
  groupName: string
  color: TaskGroupColor
  completedCount: number
}

export function useFetchTaskStats() {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<TaskStat[], RestError>({
    queryKey: [QUERY_KEYS.TASKS, organizationId, "stats"],
    queryFn: () => rest.get(`/organizations/${organizationId}/tasks/stats`),
  })
}
