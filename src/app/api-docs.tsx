import { createFileRoute } from "@tanstack/react-router"
import { ApiDocsView } from "../components/ApiDocsView"
import { Inside } from "../components/Inside"

export const Route = createFileRoute("/api-docs")({
  ssr: false,
  loader: async () => true,
  component: ApiDocsPage,
})

function ApiDocsPage() {
  return (
    <Inside title="API Documentation" breadcrumbs={[{ label: "API Docs" }]}>
      <ApiDocsView />
    </Inside>
  )
}