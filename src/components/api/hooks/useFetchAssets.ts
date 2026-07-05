import { useSuspenseQuery } from "@tanstack/react-query"
import { Asset } from "@prisma/client"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchAssets(accountId: number) {
  const { organizationId } = useGlobalState()

  return useSuspenseQuery<Asset[], RestError>({
    queryKey: [QUERY_KEYS.ASSETS, organizationId, accountId],
    queryFn: () =>
      rest.get(
        `/organizations/${organizationId || 0}/accounts/${accountId}/assets`
      ),
  })
}