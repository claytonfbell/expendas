import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import { ItemWithIncludes } from "../../ItemWithIncludes"

export function useFetchItems(date: string | null) {
  const { organizationId } = useGlobalState()

  return useSuspenseQuery<ItemWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.ITEMS, organizationId, date],
    queryFn: () => rest.get(`/organizations/${organizationId || 0}/dates/${date || ""}`),
  })
}