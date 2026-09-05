import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemoveTaxRecordFile() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, { taxRecordId: number; taxRecordFileId: number }>({
    mutationFn: (params) =>
      rest.delete(
        `/organizations/${organizationId}/taxRecords/${params.taxRecordId}/files/${params.taxRecordFileId}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
      })
    },
  })
}