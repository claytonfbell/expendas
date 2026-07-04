import DownloadIcon from "@mui/icons-material/Download"
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Form, TextField } from "material-ui-pack"
import { useEffect, useState } from "react"
import { useStorageState } from "react-storage-hooks"
import { OrganizationWithIncludes } from "../OrganizationWithIncludes"
import { useFetchOrganization } from "./api/hooks/useFetchOrganization"
import { useRemoveOrganization } from "./api/hooks/useRemoveOrganization"
import { useUpdateOrganization } from "./api/hooks/useUpdateOrganization"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { Title } from "./Title"
import { UserManage } from "./UserManage"
import rest from "./api/rest"

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
    isPending: isUpdating,
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
  const isXsDown = useMediaQuery(theme.breakpoints.down("sm"))

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
                <Grid size={12}>
                  <DisplayError error={updateError} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="name"
                    label="Organization Name"
                    formatter="capitalize"
                    size="small"
                  />
                </Grid>
              </Grid>
            </Form>
            <Grid container spacing={1}>
              <Grid size={12}>
                <br />
                {state !== undefined ? (
                  <UserManage state={state} setState={setState} />
                ) : null}
                <br />
              </Grid>
              <Grid size={4}>
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
              <Grid size={4}>
                <Button fullWidth onClick={props.onClose} variant="outlined">
                  Cancel
                </Button>
              </Grid>
              <Grid size={4}>
                <Button
                  color="error"
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
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              component={Link}
              href={`${rest.baseURL}/organizations/${props.organizationId}/export`}
            >
              Download All Data (ZIP)
            </Button>
            <br />
            <br />
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
