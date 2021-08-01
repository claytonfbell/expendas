import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import { Button } from "material-ui-bootstrap"
import React from "react"

// Simple Confirm Dialog
type ConfirmDialogProps = {
  open: boolean
  message: string
  details?: string
  yesLabel?: string
  noLabel?: string
  hiddenNoButton?: boolean
  onClose: () => void
  onAccept: () => void
}
const ConfirmDialog = ({
  open,
  message = "Are you sure?",
  details,
  yesLabel = "Yes",
  noLabel = "No",
  hiddenNoButton = false,
  onClose,
  onAccept,
}: ConfirmDialogProps) => {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{message}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {details}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {hiddenNoButton !== true && (
            <Button onClick={onClose} color="primary">
              {noLabel}
            </Button>
          )}
          <Button onClick={onAccept} color="primary" autoFocus>
            {yesLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConfirmDialog
