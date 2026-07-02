import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { Receipts } from "../components/Receipts"

export const Route = createFileRoute("/receipts")({
  ssr: false,
  loader: async () => true,
  component: ReceiptsPage,
})

function ReceiptsPage() {
  return (
    <Inside title="Receipts" breadcrumbs={[{ label: "Receipts" }]}>
      <Receipts />
    </Inside>
  )
}
