import { User } from ".prisma/client"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material"
import { CheckboxBase, Form, SubmitButton, TextField } from "material-ui-pack"
import React, { useState } from "react"
import { AddUserRequest } from "./api/AddUserRequest"
import {
  OrganizationWithIncludes,
  useAddUser,
  useCheckLogin,
  useRemoveUser,
} from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { Title } from "./Title"

interface Props {
  state: OrganizationWithIncludes
  setState: React.Dispatch<
    React.SetStateAction<OrganizationWithIncludes | undefined>
  >
}
export function UserManage(props: Props) {
  const organizationId = props.state.id

  // user
  const {
    mutateAsync: addUser,
    isLoading: isAddingUser,
    error: addUserError,
  } = useAddUser()

  const {
    mutateAsync: removeUser,
    isLoading: isRemovingUser,
    error: removeUserError,
  } = useRemoveUser()

  const [showAddUser, setShowAddUser] = useState(false)
  const [addUserState, setAddUserState] = useState<AddUserRequest>({
    email: "",
    organizationId,
  })

  function handleAddUser() {
    addUser({ ...addUserState, organizationId }).then(() => {
      setShowAddUser(false)
    })
  }
  const [removeThisUser, setRemoveThisUser] = useState<User>()
  function handleRemoveUser() {
    if (removeThisUser !== undefined) {
      removeUser({
        organizationId,
        userId: removeThisUser.id,
      })
      setRemoveThisUser(undefined)
    }
  }

  const { data: checkLogin } = useCheckLogin()

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableCell>User</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell></TableCell>
        </TableHead>
        <TableBody>
          {props.state.users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.user.email}</TableCell>
              <TableCell>
                {checkLogin?.user.id !== user.userId ? (
                  <CheckboxBase
                    value={user.isAdmin}
                    onChange={(isAdmin) => {
                      props.setState((prev) => {
                        if (prev !== undefined) {
                          return {
                            ...prev,
                            users: [...prev.users].map((x) => {
                              if (x.userId === user.userId) {
                                return { ...x, isAdmin }
                              }
                              return x
                            }),
                          }
                        }
                      })
                    }}
                  />
                ) : user.isAdmin ? (
                  "Admin"
                ) : null}
              </TableCell>
              <TableCell>
                {checkLogin?.user.id !== user.userId &&
                props.state.users.length > 1 ? (
                  <IconButton
                    size="small"
                    onClick={() => setRemoveThisUser(user.user)}
                  >
                    <DeleteIcon />
                  </IconButton>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={removeThisUser !== undefined}
        onClose={() => setRemoveThisUser(undefined)}
        message="Are you sure you want to remove this user from the organization?"
        onAccept={handleRemoveUser}
      />

      <Button
        style={{ marginTop: 18 }}
        color="primary"
        disabled={isAddingUser}
        startIcon={<AddIcon />}
        onClick={() => setShowAddUser(true)}
      >
        Add User
      </Button>
      <Dialog
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Title label="Invite User" />
          <Form
            state={addUserState}
            setState={setAddUserState}
            busy={isAddingUser}
            size="small"
            margin="none"
            onSubmit={handleAddUser}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <DisplayError error={addUserError} />
              </Grid>
              <Grid item xs={12}>
                <TextField name="email" />
              </Grid>
              <Grid item xs={6}>
                <SubmitButton>Add User</SubmitButton>
              </Grid>
              <Grid item xs={6}>
                <Button
                  onClick={() => setShowAddUser(false)}
                  fullWidth
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </Form>
          <br />
        </DialogContent>
      </Dialog>
    </>
  )
}
