import { RetirementPlan, RetirementPlanType } from "@prisma/client"
import { OptionType } from "material-ui-pack"

const retirementPlanTypes: RetirementPlanType[] = [
  "Lean",
  "Traditional",
  "Chubby",
  "Fat",
]

export const displayRetirementPlanName = (retirementPlan: RetirementPlan) => {
  return `${retirementPlan.name} (${retirementPlan.coastDate !== null ? "Coast " : ""}${retirementPlan.retirementPlanType})`
}

export const retirementPlanTypeOptions: OptionType[] = retirementPlanTypes.map(
  (value) => ({
    value,
    label: value,
  })
)
