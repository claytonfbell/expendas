import { useSuspenseQuery } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import { AssetWithTicker } from "../../AccountWithIncludes"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchAssets(accountId: number) {
  const { organizationId } = useGlobalState()

  return useSuspenseQuery<AssetWithTicker[], RestError>({
    queryKey: [QUERY_KEYS.ASSETS, organizationId, accountId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId || 0}/accounts/${accountId}/assets`
      ),
  })
}
