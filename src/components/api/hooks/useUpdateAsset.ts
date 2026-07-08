import { Asset } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

interface UpdateAssetInput {
  assetId: number
  accountId: number
  ticker: string
  assetType: string
  currentBalance: number
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()

  return useMutation<Asset, RestError, UpdateAssetInput>({
    mutationFn: (input) =>
      rest.put(
        `/organizations/${organizationId || 0}/accounts/${input.accountId}/assets/${input.assetId}`,
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