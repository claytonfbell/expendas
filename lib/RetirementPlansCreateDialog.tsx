import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { useEffect, useState } from "react"
import { useAddRetirementPlan } from "./api/api"
import DisplayError from "./DisplayError"

interface Props {
  open: boolean
  onClose: () => void
}

type FormState = {
  name: string
}

export function RetirementPlansCreateDialog({ open, onClose }: Props) {
  const {
    mutateAsync: addRetirementPlan,
    status,
    error,
  } = useAddRetirementPlan()

  useEffect(() => {
    if (!open) {
      setState({ name: "" })
    }
  }, [open])

  const [state, setState] = useState<FormState>({ name: "" })

  return (
    <>
      {/* create retirement dialog  */}
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Retirement Plan</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addRetirementPlan({ name: state.name }).then(() => {
                onClose()
              })
            }}
          >
            <Stack spacing={2} marginTop={2}>
              <DisplayError error={error} />
              <Stack spacing={2} direction={"row"}>
                <TextField
                  label="Retirement Plan Name"
                  disabled={status === "pending"}
                  value={state.name}
                  onChange={(e) => setState({ name: e.target.value })}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={status === "pending"}
                >
                  Add
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
