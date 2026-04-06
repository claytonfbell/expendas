import SettingsIcon from "@mui/icons-material/Settings"
import { Button, IconButton, Stack } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { Tabs } from "material-ui-bootstrap"
import { useState } from "react"
import { useFetchRetirementPlans } from "./api/api"
import { RetirementPlanContributions } from "./RetirementPlanContributions"
import { RetirementPlanReport } from "./RetirementPlanReport"
import { RetirementPlansCreateDialog } from "./RetirementPlansCreateDialog"
import { RetirementPlanSettingsDialog } from "./RetirementPlanSettingsDialog"
import { RetirementPlanUsers } from "./RetirementPlanUsers"

export function RetirementPlans() {
  const { data: retirementPlans } = useFetchRetirementPlans()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [editPlan, setEditPlan] = useState<RetirementPlan | null>(null)
  const selectedPlan = retirementPlans?.[selectedTab] ?? null

  return (
    <>
      <Stack>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <div>Retirement Plans</div>
          <Button variant="contained" onClick={() => setShowAddDialog(true)}>
            Add Retirement Plan
          </Button>
        </Stack>
        <Tabs
          tabs={
            retirementPlans !== undefined
              ? retirementPlans.map((x) => x.name)
              : []
          }
          onSelect={(x) => setSelectedTab(x)}
          selectedIndex={selectedTab}
        >
          {selectedPlan !== null && (
            <Stack spacing={4}>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <div>&nbsp;</div>
                <IconButton onClick={() => setEditPlan(selectedPlan)}>
                  <SettingsIcon />
                </IconButton>
              </Stack>
              <RetirementPlanContributions retirementPlan={selectedPlan} />
              <RetirementPlanUsers retirementPlan={selectedPlan} />
              <RetirementPlanReport retirementPlan={selectedPlan} />
            </Stack>
          )}
        </Tabs>
      </Stack>

      {/* create retirement dialog  */}
      <RetirementPlansCreateDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />

      {/* update / delete retirement plan dialog */}
      <RetirementPlanSettingsDialog
        retirementPlan={editPlan}
        onClose={() => setEditPlan(null)}
      />
    </>
  )
}
