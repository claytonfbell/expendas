import { Payment } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useAddPayment() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()

  return useMutation<Payment, RestError, Payment>({
    mutationFn: (params) =>
      rest.post(`/organizations/${organizationId || 0}/payments`, params),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.PAYMENTS, organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PAYMENTS] })
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ITEMS] })
    },
  })
}