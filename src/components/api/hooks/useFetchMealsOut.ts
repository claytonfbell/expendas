import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { MealsOut } from "@prisma/client"

export function useFetchMealsOut() {
  const { organizationId } = useGlobalState()
  return useQuery<MealsOut[], RestError>({
    queryKey: [QUERY_KEYS.MEALS_OUT, organizationId],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/mealsOut`),
    enabled: organizationId !== null,
  })
}