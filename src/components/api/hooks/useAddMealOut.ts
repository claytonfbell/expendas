import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { MealsOutCreateRequest } from "../../../app/api/organizations.$id.mealsOut"
import type { MealsOut } from "@prisma/client"

export function useAddMealOut() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    MealsOut,
    RestError,
    MealsOutCreateRequest
  >({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/mealsOut`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MEALS_OUT, organizationId],
      })
    },
  })
}