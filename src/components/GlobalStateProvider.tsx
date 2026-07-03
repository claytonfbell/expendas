import React, { useEffect, useMemo } from "react"
import { useStorageState } from "react-storage-hooks"
import { useDebounce } from "react-use"
import { useFetchOrganizations } from "./api/hooks/useFetchOrganizations"
import { GlobalStateContext, GlobalStateContextType } from "./GlobalStateContext"
import type { OrganizationWithIncludes } from "./OrganizationWithIncludes"

export { useGlobalState } from "./GlobalStateContext"

type ContextType = GlobalStateContextType

export function GlobalStateProvider(props: any) {
  const [organizationId, setOrganizationId] = useStorageState<number | null>(
    localStorage,
    "useSelectedOrganization.organizationId",
    null
  )

  const { data: organizations } = useFetchOrganizations()

  // auto select organizationId
  useEffect(() => {
    if (
      organizationId === null &&
      organizations !== undefined &&
      organizations.length > 0
    ) {
      setOrganizationId(organizations[0].id)
    }
  }, [organizationId, organizations, setOrganizationId])

  // auto unselct organizationId if not valid (maybe deleted or different user)
  useDebounce(
    () => {
      if (organizations !== undefined && organizationId !== null) {
        if (organizations.filter((x) => x.id === organizationId).length === 0) {
          setOrganizationId(null)
        }
      }
    },
    500,
    [organizationId, organizations, setOrganizationId]
  )

  const organization = useMemo(() => {
    return (
      (organizations !== undefined
        ? organizations.find((x) => x.id === organizationId)
        : undefined) || null
    )
  }, [organizationId, organizations])

  const value = React.useMemo(
    (): ContextType => ({
      organizationId,
      setOrganizationId,
      organization,
      organizations,
    }),
    [organization, organizationId, organizations, setOrganizationId]
  )

  return (
    <GlobalStateContext.Provider value={value}>
      {organizationId !== null ? props.children : null}
    </GlobalStateContext.Provider>
  )
}
