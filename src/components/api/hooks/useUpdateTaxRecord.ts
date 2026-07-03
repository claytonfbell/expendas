import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaxRecordWithIncludes } from "../../../app/api/organizations.$id.taxRecords"

export function useUpdateTaxRecord() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<
    TaxRecordWithIncludes,
    RestError,
    TaxRecordWithIncludes
  >({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId}/taxRecords/${params.id}`,
        params
      ),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
      })
    },
  })
}