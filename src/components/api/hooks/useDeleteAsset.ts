import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

interface DeleteAssetInput {
  assetId: number
  accountId: number
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()

  return useMutation<void, RestError, DeleteAssetInput>({
    mutationFn: (input) =>
      rest.delete(
        `/organizations/${organizationId || 0}/accounts/${input.accountId}/assets/${input.assetId}`
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
