import { QUERY_KEYS } from "./queryKeys"
import { useSuspenseQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useFetchOrganizations() {
  return useSuspenseQuery<OrganizationWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.ORGANIZATIONS],
    queryFn: () => rest.get(`/organizations`),
  })
}