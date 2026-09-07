import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { InsurancePolicyCreateRequest } from "../../../app/api/organizations.$id.insurancePolicies"
import type { InsurancePolicyWithIncludes } from "../../../app/api/organizations.$id.insurancePolicies"

export function useAddInsurancePolicy() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<InsurancePolicyWithIncludes, RestError, InsurancePolicyCreateRequest>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/insurancePolicies`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
      })
    },
  })
}