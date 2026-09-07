import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { InsurancePolicyWithIncludes } from "../../../app/api/organizations.$id.insurancePolicies"

export type InsurancePolicyUpdateRequest = Omit<
  InsurancePolicyWithIncludes,
  "insurancePolicyFiles" | "user"
>

export function useUpdateInsurancePolicy() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<InsurancePolicyWithIncludes, RestError, InsurancePolicyUpdateRequest>({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/insurancePolicies/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
      })
    },
  })
}