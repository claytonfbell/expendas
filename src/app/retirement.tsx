import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { RetirementPlans } from "../../lib/RetirementPlans"

export const Route = createFileRoute("/retirement")({
  ssr: false,
  loader: async () => true,
  component: Retirement,
})

function Retirement() {
  return (
    <Inside title="Retirement" breadcrumbs={[{ label: "Retirement" }]}>
      <RetirementPlans />
    </Inside>
  )
}
