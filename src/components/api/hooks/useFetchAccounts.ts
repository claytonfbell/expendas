import { useQuery } from "@tanstack/react-query"
import { AccountWithIncludes } from "../../AccountWithIncludes"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchAccounts() {
  const { organizationId } = useGlobalState()

  return useQuery<AccountWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.ACCOUNTS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId || 0}/accounts`),
    enabled: organizationId !== null,
  })
}
