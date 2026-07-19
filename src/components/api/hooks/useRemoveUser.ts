import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { RemoveUserRequestData } from "../types/RemoveUserRequestData"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation<
    OrganizationWithIncludes,
    RestError,
    RemoveUserRequestData
  >({
    mutationFn: (req: RemoveUserRequestData) =>
      rest.post(`/organizations/removeUser`, req),
    onMutate: (data) => {
      const predicate = [QUERY_KEYS.ORGANIZATIONS, data.organizationId]
      const prevOrg = queryClient.getQueryData<
        OrganizationWithIncludes | undefined
      >(predicate)
      if (prevOrg !== undefined) {
        queryClient.setQueryData<OrganizationWithIncludes | undefined>(
          predicate,
          {
            ...prevOrg,
            users: prevOrg.users.filter((x) => x.userId !== data.userId),
          }
        )
      }
      return () =>
        queryClient.setQueryData<OrganizationWithIncludes | undefined>(
          predicate,
          prevOrg
        )
    },
    onError: (err, newOrg, rollback) => {
      // @ts-ignore
      rollback()
    },
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.ORGANIZATIONS, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
    },
  })
}
