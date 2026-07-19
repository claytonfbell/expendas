import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { ApiKeyData } from "./useFetchApiKeys"

export function useCreateApiKey() {
  const queryClient = useQueryClient()
  return useMutation<ApiKeyData, RestError, void>({
    mutationFn: () => rest.post(`/api-keys`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.API_KEYS] })
    },
  })
}
