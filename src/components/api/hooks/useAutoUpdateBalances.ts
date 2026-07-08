import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"

export function useAutoUpdateBalances() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useQuery<void, RestError>({
    queryKey: ["autoUpdateBalances"],
    queryFn: () =>
      rest.post(`/organizations/${organizationId}/accounts/auto-update-balances`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ACCOUNTS, organizationId] })
    },
    staleTime: 0,
  })
}