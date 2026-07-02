import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { RetirementPlans } from "../components/RetirementPlans"

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
