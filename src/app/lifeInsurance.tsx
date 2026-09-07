import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { LifeInsurance } from "../components/LifeInsurance"

export const Route = createFileRoute("/lifeInsurance")({
  ssr: false,
  loader: async () => true,
  component: LifeInsurancePage,
})

function LifeInsurancePage() {
  return (
    <Inside title="Life Insurance" breadcrumbs={[{ label: "Life Insurance" }]}>
      <LifeInsurance />
    </Inside>
  )
}