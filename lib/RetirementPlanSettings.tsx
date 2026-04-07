import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import {
  Button,
  Collapse,
  Grid2,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { CurrencyFieldBase, PercentageFieldBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { useDebounce } from "react-use"
import { useDeleteRetirementPlan, useUpdateRetirementPlan } from "./api/api"
import ConfirmDialog from "./ConfirmDialog"
import DisplayError from "./DisplayError"
import { formatMoney } from "./formatMoney"

type FormState = {
  name: string
  desiredIncome: number
  healthInsuranceEstimate: number
  stockAppreciationEstimate: number
  dividendYieldEstimate: number
  inflationRateEstimate: number
  withdrawalRateEstimate: number
}

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanSettings({ retirementPlan }: Props) {
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
      updateRetirementPlan({
        ...retirementPlan,
        ...state,
      })
    },
    1000,
    [updateRetirementPlan, retirementPlan, state]
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [collapsed, setCollapsed] = useState(!isMobile)

  // up to 1 decimal place if needed, otherwise no decimals
  const withdrawalRatePercent = state.withdrawalRateEstimate / 1000
  const withdrawalRateDisplay =
    withdrawalRatePercent % 1 === 0
      ? `${withdrawalRatePercent.toFixed(0)}%`
      : `${withdrawalRatePercent.toFixed(1)}%`

  return (
    <Stack
      spacing={3}
      paddingLeft={2}
      alignItems={{ xs: "stretch", sm: "start" }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={"baseline"}
        spacing={2}
      >
        <Typography variant="h4">Retirement Plan</Typography>
        <Stack>{state.name}</Stack>
        <Stack>{formatMoney(state.desiredIncome, true)} yr spending</Stack>
        <Stack>{withdrawalRateDisplay} withdrawal rate</Stack>
        <IconButton
          sx={{
            display: { xs: "none", sm: "block" },
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Stack>

      <DisplayError error={updateError ?? deleteError} />
      <Collapse in={!collapsed} unmountOnExit>
        <Grid2
          container
          spacing={2}
          columns={{ xs: 12, sm: 16 }}
          alignItems={"center"}
        >
          <CustomGridItem>
            <TextField
              fullWidth
              label="Retirement Plan Name"
              value={state.name}
              onChange={(e) =>
                setState((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </CustomGridItem>
          <CustomGridItem>
            <CurrencyFieldBase
              fullWidth
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
              fullWidth
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
        </Grid2>

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
      </Collapse>
    </Stack>
  )
}

function CustomGridItem(props: { children: React.ReactNode }) {
  return <Grid2 size={{ xs: 4, sm: 4, md: 3, lg: 2 }}>{props.children}</Grid2>
}
