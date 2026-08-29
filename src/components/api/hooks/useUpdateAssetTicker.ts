import { AssetTicker } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useUpdateAssetTicker() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, AssetTicker>({
    mutationFn: (params) =>
      rest.put(`/asset-tickers/${params.id}`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ASSET_TICKERS],
      })
    },
  })
}
