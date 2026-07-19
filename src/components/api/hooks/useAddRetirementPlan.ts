import { RetirementPlan } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useAddRetirementPlan() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    RetirementPlan,
    RestError,
    { name: string; copyPlanId: number | null }
  >({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/retirementPlans`, params),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RETIREMENT_PLANS, organizationId],
      })
    },
  })
}
