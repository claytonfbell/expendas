import { AssetTicker } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"
import type { AssetTickerCreateRequest } from "../../../app/api/asset-tickers"

export function useAddAssetTicker() {
  const queryClient = useQueryClient()
  return useMutation<AssetTicker, RestError, AssetTickerCreateRequest>({
    mutationFn: (params) => rest.post(`/asset-tickers`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ASSET_TICKERS],
      })
    },
  })
}
