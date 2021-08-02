import React from "react"
import { AccountManage } from "./AccountManage"
import { useSelectedOrganization } from "./useSelectedOrganization"

export function OrganizationList() {
  const { organizationId } = useSelectedOrganization()

  return (
    <>
      {organizationId !== null ? (
        <AccountManage organizationId={organizationId} />
      ) : null}
    </>
  )
}
