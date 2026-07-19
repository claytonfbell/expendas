import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { PaymentWithIncludes } from "../../PaymentWithIncludes"

export function useFetchPayments(organizationId: number | null) {
  return useSuspenseQuery<PaymentWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.PAYMENTS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId || 0}/payments`),
  })
}
