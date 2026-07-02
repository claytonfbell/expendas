import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { TickerPriceResponse } from "../../../app/api/tickerPrices"

export function useFetchTickerPrices() {
  return useQuery<TickerPriceResponse, RestError>({
    queryKey: [QUERY_KEYS.TICKER_PRICES],
    queryFn: () => rest.get(`/tickerPrices`),
  })
}