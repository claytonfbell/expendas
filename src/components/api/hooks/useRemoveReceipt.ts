import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveReceipt() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (receiptId) =>
      rest.delete(`/organizations/${organizationId}/receipts/${receiptId}`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RECEIPTS, organizationId],
      })
    },
  })
}