import { Account } from "@prisma/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useAddAccount() {
  const queryClient = useQueryClient()

  return useMutation<Account, RestError, Account>({
    mutationFn: (req: Account) =>
      rest.post(`/organizations/${req.organizationId}/accounts`, req),
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, data.organizationId, data.id],
        data
      )
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] })
    },
  })
}
