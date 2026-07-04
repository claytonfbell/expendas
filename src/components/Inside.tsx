import React from "react"
import { BreadcrumbLink } from "./ExpendasBreadcrumbs"
import { InsideContent } from "./InsideContent"
import { SuspenseWrapper } from "./SuspenseWrapper"

interface Props {
  title: string
  children: React.ReactNode
  breadcrumbs: BreadcrumbLink[]
}

export function Inside(props: Props) {
  return (
    <SuspenseWrapper>
      <InsideContent {...props} />
    </SuspenseWrapper>
  )
}
