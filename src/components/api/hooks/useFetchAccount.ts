import { Account } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { QUERY_KEYS } from "./queryKeys"

export function useFetchAccount(organizationId: number, accountId: number) {
  return useQuery<Account, RestError>({
    queryKey: [QUERY_KEYS.ACCOUNTS, organizationId, accountId],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/accounts/${accountId}`),
  })
}
