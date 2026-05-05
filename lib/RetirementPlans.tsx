import AddIcon from "@mui/icons-material/Add"
import {
  IconButton,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { SelectBase } from "material-ui-pack"
import { useEffect, useState } from "react"
import { useFetchRetirementPlans } from "./api/api"
import { RetirementPlanProjection } from "./RetirementPlanProjection"
import { RetirementPlanSavings } from "./RetirementPlanSavings"
import { RetirementPlansCreateDialog } from "./RetirementPlansCreateDialog"
import { RetirementPlanSettings } from "./RetirementPlanSettings"
import { RetirementPlanSocialSecurity } from "./RetirementPlanSocialSecurity"
import { displayRetirementPlanName } from "./retirementPlanTypes"

const LOCAL_STORAGE_KEY = "RetirementPlans.lastRetirementPlanId"

export function RetirementPlans() {
  const { data: retirementPlans } = useFetchRetirementPlans()
  const [showAddDialog, setShowAddDialog] = useState(false)

  // sync selectedId with url
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const fromStorage = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (fromStorage && !isNaN(parseInt(fromStorage))) {
      return parseInt(fromStorage)
    }
    return null
  })

  useEffect(() => {
    if (selectedId !== null) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedId.toString())
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    }
  }, [selectedId])

  useEffect(() => {
    if (
      retirementPlans &&
      retirementPlans.length > 0 &&
      retirementPlans.find((plan) => plan.id === selectedId) === undefined
    ) {
      // if selectedId is not in retirementPlans, set it to the first one
      setSelectedId(retirementPlans[0].id)
    }
  }, [retirementPlans])

  const selectedPlan =
    retirementPlans?.find((plan) => plan.id === selectedId) ?? null

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <>
      <Stack spacing={4}>
        <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
          <Stack width={isMobile ? "100%" : undefined}>
            <SelectBase
              size="small"
              options={(retirementPlans ?? []).map((x) => ({
                label: displayRetirementPlanName(x),
                value: x.id,
              }))}
              onChange={(x) => setSelectedId(x as number)}
              value={selectedId}
              fullWidth={isMobile}
            />
          </Stack>
          <Tooltip title="Create new retirement plan">
            <IconButton size="small" onClick={() => setShowAddDialog(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {selectedPlan !== null && (
          <Stack width={"100%"} spacing={3}>
            <RetirementPlanSettings retirementPlan={selectedPlan} />
            <RetirementPlanSavings retirementPlan={selectedPlan} />
            <RetirementPlanSocialSecurity retirementPlan={selectedPlan} />
            <RetirementPlanProjection retirementPlan={selectedPlan} />
          </Stack>
        )}
      </Stack>

      {/* create retirement dialog  */}
      <RetirementPlansCreateDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </>
  )
}
