import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { InsurancePolicyWithIncludes } from "../../../app/api/organizations.$id.insurancePolicies"

export function useFetchInsurancePolicies() {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<InsurancePolicyWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.INSURANCE_POLICIES, organizationId],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/insurancePolicies`),
  })
}