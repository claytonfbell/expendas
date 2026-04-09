import { User } from ".prisma/client"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import {
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Stack,
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
import { UserDialog } from "./UserDialog"

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
    isPending: isAddingUser,
    error: addUserError,
  } = useAddUser()

  const {
    mutateAsync: removeUser,
    isPending: isRemovingUser,
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

  const [editUser, setEditUser] = useState<User | null>(null)

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableCell>Email</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Admin</TableCell>
          <TableCell></TableCell>
        </TableHead>
        <TableBody>
          {props.state.users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.user.email}</TableCell>
              <TableCell>
                {user.user.firstName} {user.user.lastName}
              </TableCell>
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
                <Stack direction="row" spacing={1} justifyContent={"end"}>
                  {checkLogin?.user.id !== user.userId &&
                  props.state.users.length > 1 ? (
                    <IconButton
                      size="small"
                      onClick={() => setRemoveThisUser(user.user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  ) : null}

                  <IconButton
                    size="small"
                    onClick={() => setEditUser(user.user)}
                  >
                    <EditIcon />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDialog
        organizationId={organizationId}
        user={editUser}
        onClose={() => setEditUser(null)}
      />

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
              <Grid size={12}>
                <DisplayError error={addUserError} />
              </Grid>
              <Grid size={12}>
                <TextField name="email" />
              </Grid>
              <Grid size={6}>
                <SubmitButton>Add User</SubmitButton>
              </Grid>
              <Grid size={6}>
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
