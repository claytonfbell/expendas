import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { RetirementPlanReportResponse } from "../../../app/api/organizations.$id.retirementPlans.$retirementPlanId.report"

export function useFetchRetirementPlanReport(retirementPlanId: number) {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<RetirementPlanReportResponse, RestError>({
    queryKey: [QUERY_KEYS.RETIREMENT_PLAN_REPORT, organizationId, retirementPlanId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}/report`
      ),
  })
}