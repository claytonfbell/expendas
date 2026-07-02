import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import { useGlobalState } from "../../GlobalStateContext"
import rest, { RestError } from "../rest"
import { FixedIncomeAssetWithIncludesData } from "../types/FixedIncomeAssetWithIncludes"

export function useFetchFixedIncomeAssets() {
  const { organizationId } = useGlobalState()
  return useQuery<FixedIncomeAssetWithIncludesData[], RestError>({
    queryKey: [QUERY_KEYS.FIXED_INCOME_ASSETS, organizationId],
    queryFn: () =>
      rest.get(`/organizations/${organizationId}/fixedIncomeAssets`),
    enabled: organizationId !== null,
  })
}
