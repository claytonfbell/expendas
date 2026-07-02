import { RetirementPlan } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useFetchRetirementPlans() {
  const { organizationId } = useGlobalState()
  return useQuery<RetirementPlan[], RestError>({
    queryKey: [QUERY_KEYS.RETIREMENT_PLANS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/retirementPlans`),
    enabled: organizationId !== null,
  })
}