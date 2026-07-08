import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { UserPreferencesResponseData } from "../types/UserPreferencesResponseData"

export function useFetchPreferences() {
  return useQuery<UserPreferencesResponseData, RestError>({
    queryKey: [QUERY_KEYS.USER_PREFERENCES],
    queryFn: () => rest.get("/user/preferences"),
    retry: false,
  })
}