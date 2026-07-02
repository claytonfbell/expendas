import { RetirementPlan } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useUpdateRetirementPlan() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<RetirementPlan, RestError, RetirementPlan>({
    mutationFn: (retirementPlan) =>
      rest.put(
        `/organizations/${organizationId}/retirementPlans/${retirementPlan.id}`,
        retirementPlan
      ),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RETIREMENT_PLANS, organizationId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RETIREMENT_PLAN_REPORT, organizationId, data.id],
      })
    },
  })
}