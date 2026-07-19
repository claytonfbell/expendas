import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export interface ApiKeyData {
  id: number
  key: string
  createdAt: string
}

export function useFetchApiKeys() {
  return useSuspenseQuery<ApiKeyData[], RestError>({
    queryKey: [QUERY_KEYS.API_KEYS],
    queryFn: () => rest.get(`/api-keys`),
  })
}
