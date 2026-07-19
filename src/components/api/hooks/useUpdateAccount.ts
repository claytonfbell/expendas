import { Account } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { AccountWithIncludes } from "../../AccountWithIncludes"

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation<AccountWithIncludes, RestError, AccountWithIncludes>({
    mutationFn: (account: Account) =>
      rest.put(
        `/organizations/${account.organizationId}/accounts/${account.id}`,
        account
      ),
    onMutate: (data) => {
      const predicate = [QUERY_KEYS.ACCOUNTS, data.organizationId]
      const prev = queryClient.getQueryData<Account[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Account[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () =>
        queryClient.setQueryData<Account[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.ACCOUNTS, data.organizationId, data.id],
        data
      )
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] })
    },
  })
}
