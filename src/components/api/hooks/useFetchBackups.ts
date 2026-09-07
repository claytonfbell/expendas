import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { useGlobalState } from "../../GlobalStateContext"
import type { BackupWithIncludes } from "../../../app/api/organizations.$id.backups"

export function useFetchBackups() {
  const { organizationId } = useGlobalState()
  return useSuspenseQuery<BackupWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.BACKUPS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}/backups`),
  })
}