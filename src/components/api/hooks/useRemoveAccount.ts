import { Account } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useRemoveAccount() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, Account>({
    mutationFn: (account: Account) =>
      rest.delete(
        `/organizations/${account.organizationId}/accounts/${account.id}`
      ),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] })
    },
  })
}
