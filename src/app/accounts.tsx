import { createFileRoute } from "@tanstack/react-router"
import { AccountManage } from "../../lib/AccountManage"
import { Inside } from "../../lib/Inside"

export const Route = createFileRoute("/accounts")({
  ssr: false,
  loader: async () => true,
  component: AccountsPage,
})

function AccountsPage() {
  return (
    <Inside title="Accounts" breadcrumbs={[{ label: "Accounts" }]}>
      <AccountManage />
    </Inside>
  )
}
