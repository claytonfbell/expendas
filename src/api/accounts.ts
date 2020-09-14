import { queryCache, useMutation } from "react-query"
import { IAccount } from "../db/Account"
import rest, { RestError } from "../rest"
import { usePersistedQuery } from "./usePersistedData"

const KEY = "accounts"

const api = {
  fetchAccounts: (): Promise<IAccount[]> => rest.get("/accounts"),
  createAccount: (account: IAccount): Promise<IAccount> => {
    return rest.post("/accounts", account)
  },
  updateAccount: (account: IAccount): Promise<IAccount> =>
    rest.put(`/accounts/${account._id}`, account),
}

export function useFetchAccounts() {
  return usePersistedQuery<IAccount[], RestError>(KEY, api.fetchAccounts, {
    initialData: [],
    initialStale: true,
  })
}

export function useCreateAccount() {
  return useMutation<IAccount, RestError, IAccount>(api.createAccount, {
    onSuccess: () => queryCache.invalidateQueries(KEY),
  })
}

export function useUpdateAccount() {
  return useMutation<IAccount, RestError, IAccount>(api.updateAccount, {
    onMutate: (newData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      queryCache.cancelQueries(KEY)
      // Snapshot the previous value
      const prevData: IAccount[] = queryCache.getQueryData(KEY)
      // Optimistically update to the new value
      queryCache.setQueryData(
        KEY,
        prevData.map((x) => (x._id === newData._id ? newData : x))
      )
      // Return a rollback function
      return () => queryCache.setQueryData(KEY, prevData)
    },
    // If the mutation fails, use the rollback function we returned above
    onError: (err, newData, rollback: () => void) => rollback(),
    // Always refetch after error or success:
    onSettled: () => {
      queryCache.invalidateQueries(KEY)
    },
  })
}
