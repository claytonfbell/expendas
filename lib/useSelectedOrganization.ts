import { useEffect, useMemo } from "react"
import { useStorageState } from "react-storage-hooks"
import { useFetchOrganizations } from "./api/api"

export function useSelectedOrganization() {
  const [organizationId, setOrganizationId] = useStorageState<number | null>(
    localStorage,
    "useSelectedOrganization.organizationId",
    null
  )

  const { data: organizations } = useFetchOrganizations()

  useEffect(() => {
    if (
      organizationId === null &&
      organizations !== undefined &&
      organizations.length > 0
    ) {
      setOrganizationId(organizations[0].id)
    }
  }, [organizationId, organizations, setOrganizationId])

  const organization = useMemo(() => {
    return organizations !== undefined
      ? organizations.find((x) => x.id === organizationId)
      : undefined
  }, [organizationId, organizations])

  return { organizationId, setOrganizationId, organizations, organization }
}
