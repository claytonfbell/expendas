import React, { useEffect, useMemo } from "react"
import { useStorageState } from "react-storage-hooks"
import { useDebounce } from "react-use"
import { OrganizationWithIncludes, useFetchOrganizations } from "./api/api"

type ContextType = {
  organizationId: number | null
  setOrganizationId: React.Dispatch<React.SetStateAction<number | null>>
  organization: OrganizationWithIncludes | null
  organizations: OrganizationWithIncludes[] | undefined
}

const Context = React.createContext<ContextType | undefined>(undefined)
export function useGlobalState() {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error(`useGlobalState must be used within a GlobalStateProvider`)
  }
  return context
}

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

  return <Context.Provider value={value} {...props} />
}
