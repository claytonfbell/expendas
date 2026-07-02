import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { AddUserRequestData } from "../types/AddUserRequestData"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useAddUser() {
  const queryClient = useQueryClient()

  return useMutation<OrganizationWithIncludes, RestError, AddUserRequestData>({
    mutationFn: (req: AddUserRequestData) => rest.post(`/organizations/addUser`, req),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.ORGANIZATIONS, data.id], data)
      queryClient.refetchQueries({ queryKey: [QUERY_KEYS.ORGANIZATIONS] })
    },
  })
}