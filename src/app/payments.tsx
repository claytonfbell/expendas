import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../../lib/Inside"
import { PaymentManage } from "../../lib/PaymentManage"

export const Route = createFileRoute("/payments")({
  ssr: false,
  loader: async () => true,
  component: PaymentsPage,
})

function PaymentsPage() {
  return (
    <Inside title="Payments" breadcrumbs={[{ label: "Payments" }]}>
      <PaymentManage />
    </Inside>
  )
}
