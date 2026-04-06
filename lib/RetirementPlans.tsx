import { Button, Stack } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { SelectBase } from "material-ui-pack"
import { useState } from "react"
import { useFetchRetirementPlans } from "./api/api"
import { RetirementPlanContributions } from "./RetirementPlanContributions"
import { RetirementPlanReport } from "./RetirementPlanReport"
import { RetirementPlansCreateDialog } from "./RetirementPlansCreateDialog"
import { RetirementPlanSettings } from "./RetirementPlanSettings"
import { RetirementPlanUsers } from "./RetirementPlanUsers"

export function RetirementPlans() {
  const { data: retirementPlans } = useFetchRetirementPlans()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [editPlan, setEditPlan] = useState<RetirementPlan | null>(null)
  const selectedPlan = retirementPlans?.[selectedTab] ?? null

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
              onChange={(x) => setSelectedTab(x as number)}
              value={selectedTab}
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
