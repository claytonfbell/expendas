import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { TaxRecordWithIncludes } from "../../../app/api/organizations.$id.taxRecords"

export function useFetchTaxRecords() {
  const { organizationId } = useGlobalState()
  return useQuery<TaxRecordWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.TAX_RECORDS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/taxRecords`),
    enabled: organizationId !== null,
  })
}
