import { RetirementPlan } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useFetchRetirementPlans() {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<RetirementPlan[], RestError>({
    queryKey: [QUERY_KEYS.RETIREMENT_PLANS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/retirementPlans`),
  })
}