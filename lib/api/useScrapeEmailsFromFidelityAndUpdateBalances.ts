import { useMutation, useQueryClient } from "react-query"
import { useGlobalState } from "../GlobalStateProvider"
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
  >(
    () => rest.post(`/organizations/${organizationId}/scrape-email`),

    {
      onSuccess: () => {
        queryClient.refetchQueries({ queryKey: ["accounts", organizationId] })
      },
    }
  )
}
