import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AddIcon from "@mui/icons-material/Add"
import CheckIcon from "@mui/icons-material/Check"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import ReceiptIcon from "@mui/icons-material/Receipt"
import SettingsIcon from "@mui/icons-material/Settings"
import ShowChartIcon from "@mui/icons-material/ShowChart"
import { Button, ListItemIcon } from "@mui/material"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { useRouter } from "next/dist/client/router"
import React, { useState } from "react"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import { useLogout } from "./api/api"
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

        <MenuItem onClick={menuClick(() => router.push(`/accounts`))}>
          <ListItemIcon>
            <AccountBalanceIcon />
          </ListItemIcon>
          Accounts
        </MenuItem>

        <MenuItem onClick={menuClick(() => router.push(`/payments`))}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          Payments
        </MenuItem>

        <MenuItem onClick={menuClick(() => router.push(`/investments`))}>
          <ListItemIcon>
            <ShowChartIcon />
          </ListItemIcon>
          Investments
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
