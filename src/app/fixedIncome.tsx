import { createFileRoute } from "@tanstack/react-router"
import { FixedIncomeAssets } from "../components/FixedIncomeAssets"
import { Inside } from "../components/Inside"

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
