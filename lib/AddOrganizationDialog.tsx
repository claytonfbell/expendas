import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Form, SubmitButton, TextField } from "material-ui-pack"
import React, { useState } from "react"
import { AddOrganizationRequest } from "./api/AddOrganizationRequest"
import { useAddOrganization } from "./api/api"
import DisplayError from "./DisplayError"
import { useGlobalState } from "./GlobalStateProvider"
import { Title } from "./Title"

interface Props {
  open: boolean
  onClose: () => void
}

export function AddOrganizationDialog(props: Props) {
  const [state, setState] = useState<AddOrganizationRequest>({
    name: "",
  })

  const { setOrganizationId } = useGlobalState()

  const {
    mutateAsync: addOrganization,
    isLoading,
    error,
  } = useAddOrganization()

  function handleSubmit() {
    addOrganization(state).then((newOrganization) => {
      setOrganizationId(newOrganization.id)
      props.onClose()
    })
  }

  const theme = useTheme()
  const isXsDown = useMediaQuery(theme.breakpoints.down("xs"))

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isXsDown}
    >
      <DialogContent>
        <Title label="Create New Organization" />
        <Typography>
          Only create new organization to separate user permissions.
        </Typography>
        <Form
          state={state}
          setState={setState}
          size="small"
          margin="none"
          busy={isLoading}
          onSubmit={handleSubmit}
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <DisplayError error={error} />
            </Grid>
            <Grid item xs={12}>
              <TextField name="name" formatter="capitalize" />
            </Grid>
            <Grid item xs={6}>
              <SubmitButton>Add Organization</SubmitButton>
            </Grid>
            <Grid item xs={6}>
              <Button fullWidth variant="outlined" onClick={props.onClose}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Form>
        <br />
      </DialogContent>
    </Dialog>
  )
}
