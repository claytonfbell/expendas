import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { NewFixedIncomeAssetRequestBody } from "../../../app/api/organizations.$id.fixedIncomeAssets"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { FixedIncomeAssetWithIncludesData } from "../types/FixedIncomeAssetWithIncludes"

export function useAddFixedIncomeAsset() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    FixedIncomeAssetWithIncludesData,
    RestError,
    NewFixedIncomeAssetRequestBody
  >({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/fixedIncomeAssets`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.FIXED_INCOME_ASSETS, organizationId],
      })
    },
  })
}
