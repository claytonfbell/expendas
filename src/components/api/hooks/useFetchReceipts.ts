import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { ReceiptWithIncludes } from "../../../app/api/organizations.$id.receipts"

export function useFetchReceipts() {
  const { organizationId } = useGlobalState()
  return useQuery<ReceiptWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.RECEIPTS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/receipts`),
    enabled: organizationId !== null,
  })
}