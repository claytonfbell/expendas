import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveInsurancePolicy() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (insurancePolicyId) =>
      rest.delete(
        `/organizations/${organizationId}/insurancePolicies/${insurancePolicyId}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
      })
    },
  })
}