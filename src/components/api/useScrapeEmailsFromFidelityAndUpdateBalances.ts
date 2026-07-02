import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../GlobalStateContext"
import rest, { RestError } from "./rest"

interface ScrapeEmailsFromFidelityAndUpdateBalancesResponse {
  success: boolean
  message: string
}

export function useScrapeEmailsFromFidelityAndUpdateBalances() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<
    ScrapeEmailsFromFidelityAndUpdateBalancesResponse,
    RestError
  >({
    mutationFn: () =>
      rest.post(`/organizations/${organizationId}/scrape-email`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["accounts", organizationId] })
    },
  })
}
