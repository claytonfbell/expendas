import AddIcon from "@mui/icons-material/Add"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import CheckIcon from "@mui/icons-material/Check"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import SettingsIcon from "@mui/icons-material/Settings"
import { Button, ListItemIcon, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { useRouter } from "@tanstack/react-router"
import { useDarkMode } from "material-ui-pack"
import React, { useState } from "react"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import { useLogout } from "./api/hooks/useLogout"
import { useGlobalState } from "./GlobalStateProvider"
import { navigationLinks } from "./navigationLinks"
import { OrganizationDialog } from "./OrganizationDialog"

export function UserMenu() {
  const { mutateAsync: logout } = useLogout()
  const router = useRouter()
  const { darkMode, toggleDarkMode } = useDarkMode()

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

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const userMenuLinks = navigationLinks.filter((link) =>
    isMobile
      ? !link.navs.includes("bottom-mobile")
      : !link.navs.includes("top-desktop")
  )

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

        {userMenuLinks.map((link) => (
          <MenuItem
            key={link.href}
            onClick={menuClick(() => router.navigate({ to: link.href }))}
          >
            <ListItemIcon>
              <link.Icon />
            </ListItemIcon>
            {link.label}
          </MenuItem>
        ))}

        <MenuItem onClick={() => toggleDarkMode(!darkMode)}>
          <ListItemIcon>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          Appearance
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
