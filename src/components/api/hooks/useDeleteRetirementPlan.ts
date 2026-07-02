import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useDeleteRetirementPlan() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (retirementPlanId) =>
      rest.delete(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RETIREMENT_PLANS, organizationId],
      })
    },
  })
}