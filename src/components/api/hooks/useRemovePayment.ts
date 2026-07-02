import { Payment } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useRemovePayment() {
  const { organizationId } = useGlobalState()

  const queryClient = useQueryClient()
  return useMutation<void, RestError, Payment>({
    mutationFn: (params) =>
      rest.delete(`/organizations/${organizationId || 0}/payments/${params.id}`),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.PAYMENTS] })
    },
  })
}