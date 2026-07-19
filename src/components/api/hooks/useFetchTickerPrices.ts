import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { TickerPriceResponse } from "../../../app/api/tickerPrices"

export function useFetchTickerPrices(tickers: string[]) {
  return useSuspenseQuery<TickerPriceResponse, RestError>({
    queryKey: [QUERY_KEYS.TICKER_PRICES, ...tickers.sort()],
    queryFn: () => rest.get(`/tickerPrices`, { tickers: tickers.join(",") }),
  })
}
