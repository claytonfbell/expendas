import { RetirementPlanUser, User } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useFetchRetirementPlanUsers(retirementPlanId: number | null) {
  const { organizationId } = useGlobalState()
  return useQuery<
    (RetirementPlanUser & {
      user: User
    })[],
    RestError
  >({
    queryKey: [QUERY_KEYS.RETIREMENT_PLAN_USERS, organizationId, retirementPlanId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId}/retirementPlans/${retirementPlanId}/users`
      ),
    enabled: organizationId !== null && retirementPlanId !== null,
  })
}