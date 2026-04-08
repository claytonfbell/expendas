import AddIcon from "@mui/icons-material/Add"
import { Fab, Stack, useMediaQuery, useTheme } from "@mui/material"
import { SelectBase } from "material-ui-pack"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useFetchRetirementPlans } from "./api/api"
import { RetirementPlanProjection } from "./RetirementPlanProjection"
import { RetirementPlanSavings } from "./RetirementPlanSavings"
import { RetirementPlansCreateDialog } from "./RetirementPlansCreateDialog"
import { RetirementPlanSettings } from "./RetirementPlanSettings"
import { RetirementPlanSocialSecurity } from "./RetirementPlanSocialSecurity"

const LOCAL_STORAGE_KEY = "RetirementPlans.lastRetirementPlanId"

export function RetirementPlans() {
  const { data: retirementPlans } = useFetchRetirementPlans()
  const [showAddDialog, setShowAddDialog] = useState(false)

  // sync selectedId with url
  const searchParams = useSearchParams()
  const retirementPlanIdFromUrl = searchParams.get("retirementPlanId")
  const selectedId = useMemo(() => {
    if (retirementPlanIdFromUrl) {
      return parseInt(retirementPlanIdFromUrl)
    }
    return null
  }, [retirementPlanIdFromUrl])

  const { replace } = useRouter()

  const selectedPlan =
    retirementPlans?.find((plan) => plan.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId === null) {
      const lastId = sessionStorage.getItem(LOCAL_STORAGE_KEY)
      if (lastId) {
        replace(`?retirementPlanId=${lastId}`)
      } else if (retirementPlans !== undefined && retirementPlans.length > 0) {
        replace(`?retirementPlanId=${retirementPlans[0].id}`)
      }
    } else {
      sessionStorage.setItem(LOCAL_STORAGE_KEY, selectedId.toString())
    }
  }, [retirementPlans, selectedId, replace])

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
                label: x.name,
                value: x.id,
              }))}
              onChange={(x) => replace(`?retirementPlanId=${x}`)}
              value={selectedId}
              fullWidth={isMobile}
            />
          </Stack>
          <Fab
            size="small"
            variant="circular"
            onClick={() => setShowAddDialog(true)}
          >
            <AddIcon />
          </Fab>
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
