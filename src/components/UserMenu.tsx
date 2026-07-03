import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import PaymentsIcon from "@mui/icons-material/Payments"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import SettingsIcon from "@mui/icons-material/Settings"
import { Button, ListItemIcon } from "@mui/material"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { useRouter } from "@tanstack/react-router"
import React, { useState } from "react"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import { useLogout } from "./api/hooks/useLogout"
import { useGlobalState } from "./GlobalStateProvider"
import { OrganizationDialog } from "./OrganizationDialog"

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
    useGlobalState()

  const [openSettings, setOpenSettings] = useState(false)
  const [openAddOrg, setOpenAddOrg] = useState(false)

  const menuClick = (action: () => void) => () => {
    handleClose()
    action()
  }

  return (
    <>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color="inherit"
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
        {organizations !== undefined && organizations.length > 0
          ? organizations.map((o) => (
              <MenuItem key={o.id} onClick={() => setOrganizationId(o.id)}>
                <ListItemIcon color="inherit" style={{ color: "green" }}>
                  {organizationId === o.id ? <CheckIcon /> : null}
                </ListItemIcon>

                {o.name}
              </MenuItem>
            ))
          : null}

        <MenuItem onClick={menuClick(() => setOpenSettings(true))}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          Organization Settings
        </MenuItem>

        <MenuItem onClick={menuClick(() => setOpenAddOrg(true))}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          Add Organization
        </MenuItem>

        <MenuItem
          onClick={menuClick(() => router.navigate({ to: "/accounts" }))}
        >
          <ListItemIcon>
            <AccountBalanceIcon />
          </ListItemIcon>
          Accounts
        </MenuItem>

        <MenuItem
          onClick={menuClick(() => router.navigate({ to: "/payments" }))}
        >
          <ListItemIcon>
            <PaymentsIcon />
          </ListItemIcon>
          Payments
        </MenuItem>

        <MenuItem
          onClick={menuClick(() => router.navigate({ to: "/receipts" }))}
        >
          <ListItemIcon>
            <ReceiptLongIcon />
          </ListItemIcon>
          Receipts
        </MenuItem>

        <MenuItem
          onClick={menuClick(() => router.navigate({ to: "/taxes" }))}
        >
          <ListItemIcon>
            <AccountTreeIcon />
          </ListItemIcon>
          Tax Records
        </MenuItem>

        <MenuItem onClick={menuClick(() => logout())}>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
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
