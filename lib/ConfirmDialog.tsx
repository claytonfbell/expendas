import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material"

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
          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
            {hiddenNoButton !== true && (
              <Button variant="outlined" onClick={onClose} color="primary">
                {noLabel}
              </Button>
            )}
            <Button
              disableElevation
              variant="contained"
              onClick={onAccept}
              color="primary"
              autoFocus
            >
              {yesLabel}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ConfirmDialog
