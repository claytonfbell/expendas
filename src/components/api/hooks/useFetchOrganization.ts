import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useFetchOrganization(organizationId: number | null) {
  return useSuspenseQuery<OrganizationWithIncludes, RestError>({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, organizationId],
    queryFn: () => rest.get(`/organizations/${organizationId}`),
  })
}
