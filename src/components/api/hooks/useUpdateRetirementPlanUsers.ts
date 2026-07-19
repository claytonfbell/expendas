import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useUpdateRetirementPlanUsers() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    void,
    RestError,
    {
      retirementPlanId: number
      users: { userId: number; collectSocialSecurityAge: number }[]
    }
  >({
    mutationFn: ({ retirementPlanId, users }) =>
      rest.put(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}/users`,
        { users }
      ),
    onSuccess: (_, { retirementPlanId }) => {
      queryClient.refetchQueries({
        queryKey: [
          QUERY_KEYS.RETIREMENT_PLAN_USERS,
          organizationId,
          retirementPlanId,
        ],
      })
      queryClient.refetchQueries({
        queryKey: [
          QUERY_KEYS.RETIREMENT_PLAN_REPORT,
          organizationId,
          retirementPlanId,
        ],
      })
    },
  })
}
