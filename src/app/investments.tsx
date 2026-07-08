import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { InvestmentPortfolio } from "../components/InvestmentPortfolio"
import { AutoUpdateAccountBalances } from "../components/AutoUpdateAccountBalances"

export const Route = createFileRoute("/investments")({
  ssr: false,
  loader: async () => true,
  component: Investments,
})

function Investments() {
  return (
    <Inside title="Investments" breadcrumbs={[{ label: "Investments" }]}>
      <AutoUpdateAccountBalances />
      <InvestmentPortfolio />
    </Inside>
  )
}
