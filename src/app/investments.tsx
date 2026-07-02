import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { InvestmentPortfolio } from "../../lib/InvestmentPortfolio"

export const Route = createFileRoute("/investments")({
  ssr: false,
  loader: async () => true,
  component: Investments,
})

function Investments() {
  return (
    <Inside title="Investments" breadcrumbs={[{ label: "Investments" }]}>
      <InvestmentPortfolio />
    </Inside>
  )
}
