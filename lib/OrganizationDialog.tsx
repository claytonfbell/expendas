import {
  Dialog,
  DialogContent,
  Grid,
  useMediaQuery,
  useTheme,
} from "@material-ui/core"
import { Button } from "material-ui-bootstrap"
import { Form, TextField } from "material-ui-pack"
import React, { useEffect, useState } from "react"
import { useStorageState } from "react-storage-hooks"
import {
  OrganizationWithIncludes,
  useFetchOrganization,
  useRemoveOrganization,
  useUpdateOrganization,
} from "./api/api"
import { ApiKeyManage } from "./ApiKeyManage"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { Title } from "./Title"
import { UserManage } from "./UserManage"

interface Props {
  organizationId: number
  open: boolean
  onClose: () => void
}
export function OrganizationDialog(props: Props) {
  const { data: organization } = useFetchOrganization(props.organizationId)

  const [state, setState] = useState<OrganizationWithIncludes>()

  useEffect(() => {
    if (props.open) {
      setState(organization)
    }
  }, [organization, props.open])

  const {
    mutateAsync: updateOrganization,
    isLoading: isUpdating,
    error: updateError,
  } = useUpdateOrganization()

  function handleUpdateOrganization() {
    if (state !== undefined) {
      updateOrganization(state).then(props.onClose)
    }
  }

  const { mutateAsync: removeOrganization } = useRemoveOrganization()
  const [warnDelete, setWarnDelete] = useState(false)

  function handleRemoveOrganization() {
    if (organization !== undefined) {
      removeOrganization(organization.id).then(() => {
        // to undo the org selection
        setOrganizationId(null)
        window.location.reload()
      })
    }
  }

  // matches the state on MonitorList.tsx
  const [, setOrganizationId] = useStorageState<number | null>(
    sessionStorage,
    "MonitorList.organizationId",
    null
  )

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        <Title label="Organization Setup" />
        {organization !== undefined ? (
          <>
            <Form
              state={state}
              setState={setState}
              busy={isUpdating}
              size="small"
              margin="none"
              onSubmit={handleUpdateOrganization}
            >
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <DisplayError error={updateError} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Organization Name"
                    formatter="capitalize"
                  />
                </Grid>
              </Grid>
            </Form>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <br />
                {state !== undefined ? (
                  <UserManage state={state} setState={setState} />
                ) : null}
                <br />
              </Grid>
              <Grid item xs={12}>
                <ApiKeyManage organization={organization} />
                <br />
                <br />
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={isUpdating}
                  fullWidth
                  onClick={handleUpdateOrganization}
                >
                  Save Changes
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button fullWidth onClick={props.onClose} variant="outlined">
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  style={{ marginTop: 12 }}
                  color="danger"
                  fullWidth
                  onClick={() => setWarnDelete(true)}
                  variant="outlined"
                >
                  Delete Organization
                </Button>
                <ConfirmDialog
                  open={warnDelete}
                  onClose={() => setWarnDelete(false)}
                  onAccept={handleRemoveOrganization}
                  message="Are you sure you want to remove this organization? All of the API Keys will be removed also."
                />
              </Grid>
            </Grid>

            <br />
            <br />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
