import { FixedIncomeAsset } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveFixedIncomeAsset() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, FixedIncomeAsset>({
    mutationFn: (params) =>
      rest.delete(
        `/organizations/${organizationId}/fixedIncomeAssets/${params.id}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.FIXED_INCOME_ASSETS, organizationId],
      })
    },
  })
}
