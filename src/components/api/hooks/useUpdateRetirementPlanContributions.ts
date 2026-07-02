import { useMutation, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useUpdateRetirementPlanContributions() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    void,
    RestError,
    {
      retirementPlanId: number
      contributions: { accountId: number; amount: number }[]
    }
  >({
    mutationFn: ({ retirementPlanId, contributions }) =>
      rest.put(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}/contributions`,
        { contributions }
      ),
    onSuccess: (_, { retirementPlanId }) => {
      queryClient.refetchQueries({
        queryKey: [
          QUERY_KEYS.RETIREMENT_PLAN_CONTRIBUTIONS,
          organizationId,
          retirementPlanId,
        ],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RETIREMENT_PLAN_REPORT, organizationId, retirementPlanId],
      })
    },
  })
}