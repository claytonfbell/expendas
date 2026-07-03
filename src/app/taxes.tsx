import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { TaxRecords } from "../components/TaxRecords"

export const Route = createFileRoute("/taxes")({
  ssr: false,
  loader: async () => true,
  component: TaxesPage,
})

function TaxesPage() {
  return (
    <Inside title="Tax Records" breadcrumbs={[{ label: "Tax Records" }]}>
      <TaxRecords />
    </Inside>
  )
}