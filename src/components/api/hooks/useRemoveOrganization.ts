import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useRemoveOrganization() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (organizationId: number) =>
      rest.delete(`/organizations/${organizationId}`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
    },
  })
}
