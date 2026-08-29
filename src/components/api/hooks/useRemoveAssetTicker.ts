import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useRemoveAssetTicker() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (assetTickerId) =>
      rest.delete(`/asset-tickers/${assetTickerId}`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ASSET_TICKERS],
      })
    },
  })
}
