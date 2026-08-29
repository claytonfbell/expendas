import { useSuspenseQuery } from "@tanstack/react-query"
import { AssetTicker } from "@prisma/client"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchAssetTickers() {
  return useSuspenseQuery<AssetTicker[], RestError>({
    queryKey: [QUERY_KEYS.ASSET_TICKERS],
    queryFn: () => rest.get(`/asset-tickers`),
  })
}
