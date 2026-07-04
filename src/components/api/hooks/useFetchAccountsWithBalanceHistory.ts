import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import { AccountWithBalanceHistory } from "../../AccountWithIncludes"
import { ReportRange } from "../../TrendsReportsTimeRangeSelect"

export function useFetchAccountsWithBalanceHistory(
  organizationId: number | null,
  range: ReportRange
) {
  return useSuspenseQuery<AccountWithBalanceHistory[], RestError>({
    queryKey: [QUERY_KEYS.ACCOUNTS_BALANCE_HISTORY, organizationId, range],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/accounts/balanceHistory`, {
        range,
      }),
  })
}