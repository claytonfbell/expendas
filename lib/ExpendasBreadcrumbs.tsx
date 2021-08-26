import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import Typography from "@material-ui/core/Typography"
import { useRouter } from "next/dist/client/router"
import React from "react"
import { Link } from "./Link"

export interface BreadcrumbLink {
  href?: string
  label: string
}

interface Props {
  links: BreadcrumbLink[]
}

export function ExpendasBreadcrumbs(props: Props) {
  const router = useRouter()
  const links = [
    { label: "Expendas", href: router.pathname !== "/" ? "/" : undefined },
    ...props.links,
  ]

  return (
    <Breadcrumbs aria-label="breadcrumb">
      {links.map((link) => (
        <span key={link.label}>
          {link.href !== undefined ? (
            <Link href={link.href}>{link.label}</Link>
          ) : (
            <Typography color="textPrimary">{link.label}</Typography>
          )}
        </span>
      ))}
    </Breadcrumbs>
  )
}
