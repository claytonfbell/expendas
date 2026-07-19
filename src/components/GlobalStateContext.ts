import React from "react"
import type { OrganizationWithIncludes } from "./OrganizationWithIncludes"

export type GlobalStateContextType = {
  organizationId: number | null
  setOrganizationId: React.Dispatch<React.SetStateAction<number | null>>
  organization: OrganizationWithIncludes | null
  organizations: OrganizationWithIncludes[] | undefined
}

const GlobalStateContext = React.createContext<
  GlobalStateContextType | undefined
>(undefined)

export function useGlobalState() {
  const context = React.useContext(GlobalStateContext)
  if (!context) {
    throw new Error(`useGlobalState must be used within a GlobalStateProvider`)
  }
  return context
}

export { GlobalStateContext }
