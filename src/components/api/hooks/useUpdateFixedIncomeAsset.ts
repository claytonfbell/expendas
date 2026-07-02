import { FixedIncomeAsset } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { FixedIncomeAssetWithIncludesData } from "../types/FixedIncomeAssetWithIncludes"

export function useUpdateFixedIncomeAsset() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    FixedIncomeAssetWithIncludesData,
    RestError,
    FixedIncomeAsset
  >({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/fixedIncomeAssets/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.FIXED_INCOME_ASSETS, organizationId],
      })
    },
  })
}
