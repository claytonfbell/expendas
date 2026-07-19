import { createFileRoute } from "@tanstack/react-router"
import { ApiKeysManage } from "../components/ApiKeysManage"
import { Inside } from "../components/Inside"

export const Route = createFileRoute("/api-keys")({
  ssr: false,
  loader: async () => true,
  component: ApiKeysPage,
})

function ApiKeysPage() {
  return (
    <Inside title="API Keys" breadcrumbs={[{ label: "API Keys" }]}>
      <ApiKeysManage />
    </Inside>
  )
}
