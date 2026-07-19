import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"

export function useRefreshPlaidAccounts() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<void, RestError>({
    mutationFn: () =>
      rest.post(`/organizations/${organizationId}/plaid/accounts`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ACCOUNTS, organizationId],
      })
    },
  })
}
