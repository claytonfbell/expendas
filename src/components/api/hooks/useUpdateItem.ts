import { Item } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useUpdateItem() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()

  return useMutation<Item, RestError, Item>({
    mutationFn: (params) =>
      rest.put(`/organizations/${organizationId || 0}/items/${params.id}`, params),
    onMutate: (data) => {
      const predicate = [QUERY_KEYS.ITEMS, organizationId, data.date]
      const prev = queryClient.getQueryData<Item[] | undefined>(predicate)
      if (prev !== undefined) {
        queryClient.setQueryData<Item[] | undefined>(predicate, [
          ...prev.map((x) => {
            if (x.id === data.id) {
              return data
            }
            return x
          }),
        ])
      }
      return () => queryClient.setQueryData<Item[] | undefined>(predicate, prev)
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },

    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.ITEMS, organizationId, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ITEMS] })
    },
  })
}