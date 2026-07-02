import { RetirementPlanContribution } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useFetchRetirementPlanContributions(
  retirementPlanId: number | null
) {
  const { organizationId } = useGlobalState()
  return useQuery<RetirementPlanContribution[], RestError>({
    queryKey: [QUERY_KEYS.RETIREMENT_PLAN_CONTRIBUTIONS, organizationId, retirementPlanId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}/contributions`
      ),
    enabled: organizationId !== null && retirementPlanId !== null,
  })
}