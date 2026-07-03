import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type {
  TaxRecordCreateRequest,
  TaxRecordWithIncludes,
} from "../../../app/api/organizations.$id.taxRecords"

export function useAddTaxRecord() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    TaxRecordWithIncludes,
    RestError,
    TaxRecordCreateRequest
  >({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId}/taxRecords`, params),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
      })
    },
  })
}