import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { ReceiptCreateRequest, ReceiptWithIncludes } from "../../../app/api/organizations.$id.receipts"

export function useAddReceipt() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<ReceiptWithIncludes, RestError, ReceiptCreateRequest>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/receipts`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RECEIPTS, organizationId],
      })
    },
  })
}