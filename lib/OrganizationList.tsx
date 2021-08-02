import { Box, Grid, Hidden, IconButton, Tab, Tabs } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Add from "@material-ui/icons/Add"
import SettingsIcon from "@material-ui/icons/Settings"
import { Tooltip } from "material-ui-bootstrap"
import React, { useState } from "react"
import { useStorageState } from "react-storage-hooks"
import { AccountManage } from "./AccountManage"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import { useCheckLogin, useFetchOrganizations } from "./api/api"
import { OrganizationDialog } from "./OrganizationDialog"

const useStyles = makeStyles((theme) => ({
  tabsContainer: {
    position: "relative",
  },
  addOrganizationButton: {
    position: "absolute",
    right: 0,
    top: 0,
  },
}))

export function OrganizationList() {
  const classes = useStyles()
  const { data: organizations = [] } = useFetchOrganizations()

  const [organizationId, setOrganizationId] = useStorageState<number | null>(
    sessionStorage,
    "OrganizationList.organizationId",
    null
  )
  React.useEffect(() => {
    if (organizationId === null && organizations.length > 0) {
      setOrganizationId(organizations[0].id)
    }
  }, [organizationId, organizations, setOrganizationId])

  const [showOrgDialog, setShowOrgDialog] = useState(false)

  const { data: checkLogin } = useCheckLogin()
  const isAdmin =
    (organizations
      .find((x) => x.id === organizationId)
      ?.users.filter((x) => x.isAdmin && x.userId === checkLogin?.user.id)
      .length || 0) > 0

  const [showAddOrg, setShowAddOrg] = useState(false)

  return (
    <>
      <Box className={classes.tabsContainer}>
        <Tabs
          value={organizationId}
          onChange={(x, y) => setOrganizationId(y)}
          indicatorColor="primary"
        >
          {organizations
            .sort((a, b) => a.name?.localeCompare(b.name || "") || -1)
            .map((org) => (
              <Tab value={org.id} label={org.name} key={org.id} />
            ))}
        </Tabs>
        <Hidden mdDown>
          <Tooltip title="Add New Organization">
            <IconButton
              className={classes.addOrganizationButton}
              onClick={() => setShowAddOrg(true)}
            >
              <Add />
            </IconButton>
          </Tooltip>
        </Hidden>
      </Box>

      <AddOrganizationDialog
        open={showAddOrg}
        onClose={() => setShowAddOrg(false)}
      />

      <Box padding={0} paddingTop={3} paddingBottom={3}>
        <Grid container spacing={2} justify="space-between" alignItems="center">
          <Grid item></Grid>
          <Grid item>
            {isAdmin ? (
              <Tooltip title="Organization Setup">
                <IconButton onClick={() => setShowOrgDialog(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            {organizationId !== null ? (
              <OrganizationDialog
                organizationId={organizationId}
                open={showOrgDialog}
                onClose={() => setShowOrgDialog(false)}
              />
            ) : null}
          </Grid>
        </Grid>
      </Box>
      {organizationId !== null ? (
        <AccountManage organizationId={organizationId} />
      ) : null}
    </>
  )
}
