import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { PaymentManage } from "../components/PaymentManage"

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
