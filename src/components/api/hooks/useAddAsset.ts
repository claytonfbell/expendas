import { Asset, AssetType } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

interface AddAssetInput {
  accountId: number
  ticker: string
  assetType: AssetType
  currentBalance: number
}

export function useAddAsset() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()

  return useMutation<Asset, RestError, AddAssetInput>({
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