import { Stack } from "@mui/material"
import { RetirementPlan } from "@prisma/client"
import { useFetchRetirementPlanReport } from "./api/api"

interface Props {
  retirementPlan: RetirementPlan
}

export function RetirementPlanReport({ retirementPlan }: Props) {
  const { data: report } = useFetchRetirementPlanReport(retirementPlan.id)

  return (
    <Stack spacing={1} alignItems={"start"}>
      <pre>{JSON.stringify(report, null, 2)}</pre>
    </Stack>
  )
}
