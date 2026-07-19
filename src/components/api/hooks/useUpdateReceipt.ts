import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { ReceiptWithIncludes } from "../../../app/api/organizations.$id.receipts"

export function useUpdateReceipt() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<ReceiptWithIncludes, RestError, ReceiptWithIncludes>({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/receipts/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.RECEIPTS, organizationId],
      })
    },
  })
}
