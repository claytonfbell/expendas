import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { TrendsReports } from "../../lib/TrendsReports"

export const Route = createFileRoute("/trends")({
  ssr: false,
  loader: async () => true,
  component: Trends,
})

function Trends() {
  return (
    <Inside title="Trends" breadcrumbs={[{ label: "Trends" }]}>
      <TrendsReports />
    </Inside>
  )
}
