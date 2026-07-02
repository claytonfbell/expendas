import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useFetchDates() {
  const { organizationId } = useGlobalState()

  return useQuery<string[], RestError>({
    queryKey: [QUERY_KEYS.DATES, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId || 0}/dates`),
    enabled: organizationId !== null,
  })
}