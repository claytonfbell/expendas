import { QUERY_KEYS } from "./queryKeys"
import { useQuery } from "@tanstack/react-query"
import rest, { RestError } from "../rest"
import type { OrganizationWithIncludes } from "../../OrganizationWithIncludes"

export function useFetchOrganizations() {
  return useQuery<OrganizationWithIncludes[], RestError>({
    queryKey: [QUERY_KEYS.ORGANIZATIONS],
    queryFn: () => rest.get(`/organizations`),
  })
}