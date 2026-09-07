import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveInsurancePolicyFile() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    void,
    RestError,
    { insurancePolicyId: number; insurancePolicyFileId: number }
  >({
    mutationFn: (params) =>
      rest.delete(
        `/organizations/${organizationId}/insurancePolicies/${params.insurancePolicyId}/files/${params.insurancePolicyFileId}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
      })
    },
  })
}