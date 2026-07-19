import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveTaxRecord() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (taxRecordId) =>
      rest.delete(`/organizations/${organizationId}/taxRecords/${taxRecordId}`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
      })
    },
  })
}
