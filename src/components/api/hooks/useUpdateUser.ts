import { User } from "@prisma/client"
import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation<void, RestError, { user: User; organizationId: number }>({
    mutationFn: ({ user, organizationId }) =>
      rest.put(`/organizations/${organizationId}/users/${user.id}`, user),
    onSuccess: (_, { user, organizationId }) => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.ORGANIZATIONS, organizationId],
      })
    },
  })
}