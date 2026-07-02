import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { ScrapeEmailsFromFidelityAndUpdateBalancesResponseData } from "../types/ScrapeEmailsFromFidelityAndUpdateBalancesResponseData"

export function useScrapeEmailsFromFidelityAndUpdateBalances() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<
    ScrapeEmailsFromFidelityAndUpdateBalancesResponseData,
    RestError
  >({
    mutationFn: () =>
      rest.post(`/organizations/${organizationId}/scrape-email`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["accounts", organizationId] })
    },
  })
}
