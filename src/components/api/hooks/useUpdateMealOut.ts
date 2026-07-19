import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { MealsOut } from "@prisma/client"

export function useUpdateMealOut() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, MealsOut>({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/mealsOut/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.MEALS_OUT, organizationId],
      })
    },
  })
}
