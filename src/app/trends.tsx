import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { TrendsReports } from "../components/TrendsReports"

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
