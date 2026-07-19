import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    OrganizationWithIncludes
  >({
    mutationFn: (organization: OrganizationWithIncludes) =>
      rest.put(`/organizations/${organization.id}`, organization),
    onSuccess: (data) => {
      const organizations = queryClient.getQueryData<
        OrganizationWithIncludes[]
      >([QUERY_KEYS.ORGANIZATIONS])
      if (organizations !== undefined) {
        queryClient.setQueryData(
          [QUERY_KEYS.ORGANIZATIONS],
          [...organizations, data]
        )
      }
      queryClient.setQueryData([QUERY_KEYS.ORGANIZATIONS, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
    },
  })
}
