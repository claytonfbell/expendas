import { QUERY_KEYS } from "./queryKeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { BackupWithIncludes } from "../../../app/api/organizations.$id.backups"

export function useCreateBackup() {
  const queryClient = useQueryClient()
  const { organizationId } = useGlobalState()
  return useMutation<BackupWithIncludes, RestError, void>({
    mutationFn: () =>
      rest.post(`/organizations/${organizationId}/backups`),
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: [QUERY_KEYS.BACKUPS, organizationId],
      })
    },
  })
}