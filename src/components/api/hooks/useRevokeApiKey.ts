import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useRevokeApiKey() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (id: number) => rest.delete(`/api-keys/${id}`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.API_KEYS] })
    },
  })
}