import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { SelectBase } from "material-ui-pack"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAddRetirementPlan, useFetchRetirementPlans } from "./api/api"
import DisplayError from "./DisplayError"

interface Props {
  open: boolean
  onClose: () => void
}

type FormState = {
  name: string
  copyPlanId: number | null
}

export function RetirementPlansCreateDialog({ open, onClose }: Props) {
  const {
    mutateAsync: addRetirementPlan,
    status,
    error,
  } = useAddRetirementPlan()

  useEffect(() => {
    if (!open) {
      setState({ name: "", copyPlanId: null })
    }
  }, [open])

  const [state, setState] = useState<FormState>({ name: "", copyPlanId: null })

  const { data: retirementPlans } = useFetchRetirementPlans()

  const { replace } = useRouter()

  return (
    <>
      {/* create retirement dialog  */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>Add Retirement Plan</DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addRetirementPlan(state).then((newPlan) => {
                onClose()
                replace(`?retirementPlanId=${newPlan.id}`)
                return newPlan
              })
            }}
          >
            <Stack spacing={2} marginTop={2}>
              <DisplayError error={error} />
              <Stack spacing={2}>
                <TextField
                  label="New Plan Name"
                  disabled={status === "pending"}
                  value={state.name}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <SelectBase
                  label="Copy Existing Plan (optional)"
                  allowNull
                  value={state.copyPlanId}
                  onChange={(copyPlanId) =>
                    setState((prev) => ({
                      ...prev,
                      copyPlanId: copyPlanId as number | null,
                    }))
                  }
                  options={
                    retirementPlans?.map((plan) => ({
                      label: plan.name,
                      value: plan.id,
                    })) || []
                  }
                />

                <Stack
                  direction={"row"}
                  spacing={2}
                  justifyContent={"flex-end"}
                >
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={status === "pending"}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={status === "pending"}
                  >
                    {state.copyPlanId ? "Copy & Create" : "Create"}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
