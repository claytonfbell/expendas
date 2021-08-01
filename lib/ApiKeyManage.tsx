import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"
import { ApiKey } from "@prisma/client"
import { Alert } from "material-ui-bootstrap"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import {
  OrganizationWithIncludes,
  useAddApiKey,
  useRemoveApiKey,
} from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"

interface Props {
  organization: OrganizationWithIncludes
}
export function ApiKeyManage(props: Props) {
  const organizationId = props.organization.id

  const {
    mutateAsync: addApiKey,
    isLoading: isAddingApiKey,
    error: addApiKeyError,
  } = useAddApiKey()

  const {
    mutateAsync: removeApiKey,
    isLoading: isRemovingApiKey,
    error: removeApiKeyError,
  } = useRemoveApiKey()

  const error = addApiKeyError || removeApiKeyError

  function handleAddApiKey() {
    addApiKey({ organizationId })
  }
  const [removeThisApiKey, setRemoveThisApiKey] = useState<ApiKey>()
  function handleRemoveApiKey() {
    if (removeThisApiKey !== undefined) {
      removeApiKey({
        organizationId,
        apiKeyId: removeThisApiKey.id,
      })
      setRemoveThisApiKey(undefined)
    }
  }

  return (
    <>
      <DisplayError error={error} />
      {props.organization.apiKeys.length > 0 ? (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>API Key</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.organization.apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.apiKey}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setRemoveThisApiKey(apiKey)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Alert color="info">
          <ReactMarkdown>
            {`Your organization doesn't have an API Key yet. 

Create one in order to start submitting pings from your applications.`}
          </ReactMarkdown>
        </Alert>
      )}

      <ConfirmDialog
        open={removeThisApiKey !== undefined}
        onClose={() => setRemoveThisApiKey(undefined)}
        message="Are you sure you want to remove this API Key from the organization? System could fail to receive pings."
        onAccept={handleRemoveApiKey}
      />
      <Button
        style={{ marginTop: 18 }}
        color="primary"
        disabled={isAddingApiKey}
        startIcon={<AddIcon />}
        onClick={handleAddApiKey}
      >
        Add API Key
      </Button>
    </>
  )
}
