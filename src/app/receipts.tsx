import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { Receipts } from "../../lib/Receipts"

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
