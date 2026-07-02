import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<void, RestError>({
    mutationFn: () => rest.delete(`/login`),
    onSuccess: () => {
      queryClient.setQueryData([QUERY_KEYS.LOGIN], undefined)
      window.location.href = "/"
    },
  })
}