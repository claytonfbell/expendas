import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { PaymentWithIncludes } from "../../PaymentWithIncludes"

export function useFetchPayment(organizationId: number, paymentId: number) {
  return useQuery<PaymentWithIncludes, RestError>({
    queryKey: [QUERY_KEYS.PAYMENTS, organizationId, paymentId],
    queryFn: () => rest.get(`/organizations/${organizationId}/payments/${paymentId}`),
  })
}