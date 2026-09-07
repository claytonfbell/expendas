import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"

export function useDeleteBackup() {
  const { organizationId } = useGlobalState()
  const queryClient = useQueryClient()
  return useMutation<void, RestError, number>({
    mutationFn: (backupId) =>
      rest.delete(`/organizations/${organizationId}/backups/${backupId}`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.BACKUPS, organizationId],
      })
    },
  })
}