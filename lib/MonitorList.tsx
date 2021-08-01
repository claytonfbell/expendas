import { Box, Grid, Hidden, IconButton, Tab, Tabs } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import Add from "@material-ui/icons/Add"
import SendIcon from "@material-ui/icons/Send"
import SettingsIcon from "@material-ui/icons/Settings"
import { Alert, Tooltip } from "material-ui-bootstrap"
import React, { useState } from "react"
import { useStorageState } from "react-storage-hooks"
import { AddOrganizationDialog } from "./AddOrganizationDialog"
import {
  useCheckLogin,
  useFetchMonitor,
  useFetchOrganizations,
} from "./api/api"
import { FilterStatusToggle } from "./FilterStatusToggle"
import { MonitorGroupBox } from "./MonitorGroupBox"
import { OrganizationDialog } from "./OrganizationDialog"
import { PingDialog } from "./PingDialog"

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

export function MonitorList() {
  const classes = useStyles()
  const { data: organizations = [] } = useFetchOrganizations()

  const [organizationId, setOrganizationId] = useStorageState<number | null>(
    sessionStorage,
    "MonitorList.organizationId",
    null
  )
  React.useEffect(() => {
    if (organizationId === null && organizations.length > 0) {
      setOrganizationId(organizations[0].id)
    }
  }, [organizationId, organizations, setOrganizationId])

  const { data: monitorResponse, isLoading } = useFetchMonitor(organizationId)

  const [showPing, setShowPing] = useState(false)
  const [showOrgDialog, setShowOrgDialog] = useState(false)

  const [onlyFailures, setOnlyFailures] = useState<boolean>(false)

  // apply filters
  const filtered = (monitorResponse?.groups || [])
    .map((y) => ({
      ...y,
      items: y.items
        // apply selection filters
        .filter(
          (x) => (x.status === "ok" && !onlyFailures) || x.status === "failed"
        )
        // sort items alpbabetically
        .sort((a, b) => a.pingSetup.name.localeCompare(b.pingSetup.name)),
    }))
    // remove groups not containing any items
    .filter((x) => x.items.length > 0)
    // sort groups alphabetically
    .sort((a, b) => a.groupName.localeCompare(b.groupName))

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
          <Grid item>
            <FilterStatusToggle
              selected={onlyFailures}
              onSelect={(v) => setOnlyFailures(v)}
            />
          </Grid>
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
            {isAdmin ? (
              <Tooltip title="Submit a test ping">
                <IconButton onClick={() => setShowPing(true)}>
                  <SendIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            <PingDialog
              open={showPing}
              onClose={() => setShowPing(false)}
              defaultApiKey={
                organizations
                  .find((x) => x.id === organizationId)
                  ?.apiKeys.find((x) => true)?.apiKey || ""
              }
            />
          </Grid>
        </Grid>
      </Box>

      {isLoading ? "Loading..." : null}
      {monitorResponse !== undefined ? (
        <>
          {filtered.length === 0 ? (
            <Alert color="info">Nothing to display.</Alert>
          ) : null}

          {filtered.map((group) => {
            return <MonitorGroupBox key={group.groupName} group={group} />
          })}
        </>
      ) : null}
    </>
  )
}
