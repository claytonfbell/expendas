import { createFileRoute } from "@tanstack/react-router"
import { FixedIncomeAssets } from "../../lib/FixedIncomeAssets"
import { Inside } from "../../lib/Inside"

export const Route = createFileRoute("/fixedIncome")({
  ssr: false,
  loader: async () => true,
  component: FixedIncome,
})

function FixedIncome() {
  return (
    <Inside title="Fixed Income" breadcrumbs={[{ label: "Fixed Income" }]}>
      <FixedIncomeAssets />
    </Inside>
  )
}
