import { Button, Grid, Stack, TextField } from "@mui/material"
import { RetirementPlan, RetirementPlanType } from "@prisma/client"
import {
  CurrencyFieldBase,
  DatePickerBase,
  PercentageFieldBase,
  SelectBase,
} from "material-ui-pack"
import { useEffect, useState } from "react"
import { useDebounce } from "react-use"
import { RetirementPlanUpdateRequest } from "../pages/api/organizations/[id]/retirementPlans/[retirementPlanId]"
import { useDeleteRetirementPlan, useUpdateRetirementPlan } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"
import { RetirementPlanSection } from "./RetirementPlanSection"
import { retirementPlanTypeOptions } from "./retirementPlanTypes"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanSettings({ retirementPlan }: Props) {
  const [state, setState] = useState<RetirementPlanUpdateRequest>({
    id: retirementPlan.id,
    name: "",
    desiredIncome: 0,
    healthInsuranceEstimate: 0,
    stockAppreciationEstimate: 0,
    dividendYieldEstimate: 0,
    inflationRateEstimate: 0,
    withdrawalRateEstimate: 0,
    retirementPlanType: "Traditional",
    coastDate: null,
  })
  useEffect(() => {
    if (retirementPlan !== null) {
      setState({
        id: retirementPlan.id,
        name: retirementPlan.name,
        desiredIncome: retirementPlan.desiredIncome,
        healthInsuranceEstimate: retirementPlan.healthInsuranceEstimate,
        stockAppreciationEstimate: retirementPlan.stockAppreciationEstimate,
        dividendYieldEstimate: retirementPlan.dividendYieldEstimate,
        inflationRateEstimate: retirementPlan.inflationRateEstimate,
        withdrawalRateEstimate: retirementPlan.withdrawalRateEstimate,
        retirementPlanType: retirementPlan.retirementPlanType,
        coastDate: retirementPlan.coastDate,
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

  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    const timeout = setTimeout(() => {
      setReady(true)
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [retirementPlan.id])

  useDebounce(
    () => {
      if (!ready) return
      if (retirementPlan.id !== state.id) {
        console.warn("ID mismatch between state and prop, skipping update")
        return
      }
      updateRetirementPlan({
        ...retirementPlan,
        ...state,
      })
    },
    1000,
    [updateRetirementPlan, retirementPlan, state]
  )

  // up to 1 decimal place if needed, otherwise no decimals
  const withdrawalRatePercent = state.withdrawalRateEstimate / 1000
  const withdrawalRateDisplay =
    withdrawalRatePercent % 1 === 0
      ? `${withdrawalRatePercent.toFixed(0)}%`
      : `${withdrawalRatePercent.toFixed(1)}%`

  return (
    <RetirementPlanSection
      title="Retirement Plan"
      summary={
        <>
          <Stack>{formatMoney(state.desiredIncome, true)} yr spending</Stack>
          <Stack>{withdrawalRateDisplay} withdrawal rate</Stack>
        </>
      }
      collapsible
    >
      <DisplayError error={updateError ?? deleteError} />

      <Grid
        container
        spacing={2}
        columns={{ xs: 12, sm: 16, lg: 18, xl: 21 }}
        alignItems={"center"}
      >
        <CustomGridItem>
          <TextField
            size="small"
            fullWidth
            label="Title"
            value={state.name}
            onChange={(e) =>
              setState((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </CustomGridItem>
        <CustomGridItem>
          <SelectBase
            size="small"
            options={retirementPlanTypeOptions}
            value={state.retirementPlanType}
            onChange={(value) =>
              setState((prev) => ({
                ...prev,
                retirementPlanType: value as RetirementPlanType,
              }))
            }
            label="Plan Type"
          />
        </CustomGridItem>

        <CustomGridItem>
          <DatePickerBase
            size="small"
            value={state.coastDate}
            onChange={(value) =>
              setState((prev) => ({
                ...prev,
                coastDate: value as RetirementPlanType,
              }))
            }
            label="Coast Date"
          />
        </CustomGridItem>

        <CustomGridItem>
          <CurrencyFieldBase
            size="small"
            fullWidth
            currency="USD"
            allowCents={false}
            label="Desired Income"
            value={state.desiredIncome / 100}
            onChange={(value) =>
              setState((prev) => ({
                ...prev,
                desiredIncome: Math.round(value * 100),
              }))
            }
          />
        </CustomGridItem>

        <CustomGridItem>
          <CurrencyFieldBase
            size="small"
            fullWidth
            currency="USD"
            allowCents={false}
            label="Health Insurance"
            value={state.healthInsuranceEstimate / 100}
            onChange={(value) =>
              setState((prev) => ({
                ...prev,
                healthInsuranceEstimate: Math.round(value * 100),
              }))
            }
          />
        </CustomGridItem>

        <CustomGridItem>
          <PercentageFieldBase
            size="small"
            fullWidth
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
        </CustomGridItem>

        <CustomGridItem>
          <PercentageFieldBase
            size="small"
            fullWidth
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
        </CustomGridItem>

        <CustomGridItem>
          <PercentageFieldBase
            size="small"
            fullWidth
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
        </CustomGridItem>

        <CustomGridItem>
          <PercentageFieldBase
            size="small"
            fullWidth
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
        </CustomGridItem>

        <CustomGridItem>
          <Button
            size="large"
            fullWidth
            variant="outlined"
            color="error"
            disabled={deleteStatus === "pending"}
            onClick={() => {
              setShowDeleteConfirm(true)
            }}
          >
            Delete
          </Button>
        </CustomGridItem>
      </Grid>

      <Stack spacing={2}>
        <Stack spacing={2}>
          <ConfirmDialog
            open={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onAccept={() => {
              setShowDeleteConfirm(false)
              if (retirementPlan !== null) {
                deleteRetirementPlan(retirementPlan.id)
              }
            }}
            message="Are you sure you want to delete this retirement plan?"
          />
        </Stack>
      </Stack>
    </RetirementPlanSection>
  )
}

function CustomGridItem(props: { children: React.ReactNode }) {
  return (
    <Grid size={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 3 }}>{props.children}</Grid>
  )
}
