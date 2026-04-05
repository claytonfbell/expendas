import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { CurrencyFieldBase, PercentageFieldBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { useDeleteRetirementPlan, useUpdateRetirementPlan } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"

interface Props {
  retirementPlan: RetirementPlan | null
  onClose: () => void
}

type FormState = {
  name: string
  desiredIncome: number
  healthInsuranceEstimate: number
  stockAppreciationEstimate: number
  dividendYieldEstimate: number
  inflationRateEstimate: number
  withdrawalRateEstimate: number
}

export function RetirementPlanSettingsDialog({
  retirementPlan,
  onClose,
}: Props) {
  const [state, setState] = useState<FormState>({
    name: "",
    desiredIncome: 0,
    healthInsuranceEstimate: 0,
    stockAppreciationEstimate: 0,
    dividendYieldEstimate: 0,
    inflationRateEstimate: 0,
    withdrawalRateEstimate: 0,
  })
  useEffect(() => {
    if (retirementPlan !== null) {
      setState({
        name: retirementPlan.name,
        desiredIncome: retirementPlan.desiredIncome,
        healthInsuranceEstimate: retirementPlan.healthInsuranceEstimate,
        stockAppreciationEstimate: retirementPlan.stockAppreciationEstimate,
        dividendYieldEstimate: retirementPlan.dividendYieldEstimate,
        inflationRateEstimate: retirementPlan.inflationRateEstimate,
        withdrawalRateEstimate: retirementPlan.withdrawalRateEstimate,
      })
    }
  }, [retirementPlan])

  const {
    mutateAsync: updateRetirementPlan,
    status: updateStatus,
    error: updateError,
  } = useUpdateRetirementPlan()

  const {
    mutateAsync: deleteRetirementPlan,
    status: deleteStatus,
    error: deleteError,
  } = useDeleteRetirementPlan()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      {/* update / delete retirement plan dialog */}
      <Dialog
        open={retirementPlan !== null}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Retirement Plan</DialogTitle>
        <DialogContent>
          {/* for now, only allow editing the name */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (retirementPlan !== null) {
                updateRetirementPlan({
                  ...retirementPlan,
                  ...state,
                }).then(() => {
                  onClose()
                })
              }
            }}
          >
            <Stack spacing={2} marginTop={2}>
              <DisplayError error={updateError || deleteError} />
              {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
              <Stack spacing={2}>
                <TextField
                  label="Retirement Plan Name"
                  disabled={updateStatus === "pending"}
                  value={state.name}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <CurrencyFieldBase
                  label="Desired Income"
                  value={state.desiredIncome / 100}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      desiredIncome: Math.round(value * 100),
                    }))
                  }
                />
                <CurrencyFieldBase
                  label="Health Insurance"
                  value={state.healthInsuranceEstimate / 100}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      healthInsuranceEstimate: Math.round(value * 100),
                    }))
                  }
                />
                <PercentageFieldBase
                  label="Stock Appreciation"
                  decimals={5}
                  value={state.stockAppreciationEstimate / 100000}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      stockAppreciationEstimate: Math.round(value * 100000),
                    }))
                  }
                />
                <PercentageFieldBase
                  label="Dividend Yield"
                  decimals={5}
                  value={state.dividendYieldEstimate / 100000}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      dividendYieldEstimate: Math.round(value * 100000),
                    }))
                  }
                />
                <PercentageFieldBase
                  label="Inflation Rate"
                  decimals={5}
                  value={state.inflationRateEstimate / 100000}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      inflationRateEstimate: Math.round(value * 100000),
                    }))
                  }
                />
                <PercentageFieldBase
                  label="Withdrawal Rate"
                  decimals={5}
                  value={state.withdrawalRateEstimate / 100000}
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      withdrawalRateEstimate: Math.round(value * 100000),
                    }))
                  }
                />
                <Stack
                  direction={"row"}
                  spacing={2}
                  justifyContent={"space-between"}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateStatus === "pending"}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={deleteStatus === "pending"}
                    onClick={() => {
                      setShowDeleteConfirm(true)
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onAccept={() => {
          setShowDeleteConfirm(false)
          if (retirementPlan !== null) {
            deleteRetirementPlan(retirementPlan.id).then(() => {
              onClose()
            })
          }
        }}
        message="Are you sure you want to delete this retirement plan?"
      />
    </>
  )
}
