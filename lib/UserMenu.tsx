import { Divider, ListItemIcon } from "@material-ui/core"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import CheckIcon from "@material-ui/icons/Check"
import { Button } from "material-ui-bootstrap"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import { useLogout } from "./api/api"
import { OrganizationDialog } from "./OrganizationDialog"
import { useSelectedOrganization } from "./useSelectedOrganization"

export function UserMenu() {
  const { mutateAsync: logout } = useLogout()
  const router = useRouter()

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const { organizations, organization, organizationId, setOrganizationId } =
    useSelectedOrganization()

  const [openSettings, setOpenSettings] = useState(false)
  const [openAddOrg, setOpenAddOrg] = useState(false)

  return (
    <>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {organization?.name || "Menu"}
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {organizations !== undefined && organizations.length > 0 ? (
          <>
            {organizations.map((o) => (
              <MenuItem key={o.id} onClick={() => setOrganizationId(o.id)}>
                <ListItemIcon>
                  {organizationId === o.id ? <CheckIcon /> : null}
                </ListItemIcon>

                {o.name}
              </MenuItem>
            ))}
            <Divider />
          </>
        ) : null}
        <MenuItem onClick={() => setOpenAddOrg(true)}>
          <ListItemIcon />
          Add Organization
        </MenuItem>
        <MenuItem onClick={() => router.push(`/accounts`)}>
          <ListItemIcon />
          Accounts
        </MenuItem>
        <MenuItem onClick={() => setOpenSettings(true)}>
          <ListItemIcon />
          Settings
        </MenuItem>
        <MenuItem onClick={() => logout()}>
          <ListItemIcon />
          Logout
        </MenuItem>
      </Menu>
      {organizationId !== null ? (
        <OrganizationDialog
          organizationId={organizationId}
          open={openSettings}
          onClose={() => setOpenSettings(false)}
        />
      ) : null}

      <AddOrganizationDialog
        open={openAddOrg}
        onClose={() => setOpenAddOrg(false)}
      />
    </>
  )
}
