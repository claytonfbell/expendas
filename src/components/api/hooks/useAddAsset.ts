import { Asset } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"
import { AssetWithTicker } from "../../AccountWithIncludes"

interface AddAssetInput {
  accountId: number
  assetTickerId: number
  currentBalance: number
}

export function useAddAsset() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()

  return useMutation<AssetWithTicker, RestError, AddAssetInput>({
    mutationFn: (input) =>
      rest.post(
        `/organizations/${organizationId || 0}/accounts/${input.accountId}/assets`,
        input
      ),
    onSuccess: (data, variables) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ASSETS, organizationId, variables.accountId],
      })
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ACCOUNTS, organizationId],
      })
    },
  })
}
