import { Payment } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useUpdatePayment() {
  const { organizationId } = useGlobalState()

  const queryClient = useQueryClient()
  return useMutation<Payment, RestError, Payment>({
    mutationFn: (params) =>
      rest.put(
        `/organizations/${organizationId || 0}/payments/${params.id}`,
        params
      ),
    onMutate: (data) => {
      const predicate = [QUERY_KEYS.PAYMENTS, organizationId]
      const prev = queryClient.getQueryData<Payment[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Payment[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () =>
        queryClient.setQueryData<Payment[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.PAYMENTS, organizationId, data.id],
        data
      )
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PAYMENTS] })
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ITEMS] })
    },
  })
}
