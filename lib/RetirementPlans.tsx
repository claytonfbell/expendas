import { Button, Stack } from "@mui/material"
import { SelectBase } from "material-ui-pack"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useFetchRetirementPlans } from "./api/api"
import { RetirementPlanContributions } from "./RetirementPlanContributions"
import { RetirementPlanReport } from "./RetirementPlanReport"
import { RetirementPlansCreateDialog } from "./RetirementPlansCreateDialog"
import { RetirementPlanSettings } from "./RetirementPlanSettings"
import { RetirementPlanUsers } from "./RetirementPlanUsers"

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
  }, [retirementPlanIdFromUrl, retirementPlans])

  const { replace } = useRouter()

  const selectedPlan =
    retirementPlans?.find((plan) => plan.id === selectedId) ?? null

  useEffect(() => {
    if (selectedId === null) {
      if (retirementPlans && retirementPlans.length > 0) {
        replace(`?retirementPlanId=${retirementPlans[0].id}`)
      }
    }
  }, [retirementPlans, selectedId, replace])

  return (
    <>
      <Stack spacing={4}>
        <Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
          <Stack>
            <SelectBase
              size="small"
              options={(retirementPlans ?? []).map((x) => ({
                label: x.name,
                value: x.id,
              }))}
              onChange={(x) => replace(`?retirementPlanId=${x}`)}
              value={selectedId}
              fullWidth={false}
            />
          </Stack>
          <Button variant="contained" onClick={() => setShowAddDialog(true)}>
            Add Retirement Plan
          </Button>
        </Stack>

        {selectedPlan !== null && (
          <Stack width={"100%"} spacing={3}>
            <RetirementPlanSettings retirementPlan={selectedPlan} />
            <RetirementPlanUsers retirementPlan={selectedPlan} />
            <RetirementPlanContributions retirementPlan={selectedPlan} />
            <RetirementPlanReport retirementPlan={selectedPlan} />
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
