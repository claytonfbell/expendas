import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { AddOrganizationRequestData } from "../types/AddOrganizationRequestData"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useAddOrganization() {
  const queryClient = useQueryClient()
  return useMutation<
    OrganizationWithIncludes,
    RestError,
    AddOrganizationRequestData
  >({
    mutationFn: (req: AddOrganizationRequestData) =>
      rest.post(`/organizations`, req),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.ORGANIZATIONS, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
    },
  })
}
