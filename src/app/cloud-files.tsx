import { createFileRoute } from "@tanstack/react-router"
import { CloudFilesManage } from "../components/CloudFilesManage"
import { Inside } from "../components/Inside"

export const Route = createFileRoute("/cloud-files")({
  ssr: false,
  loader: async () => true,
  component: CloudFilesPage,
})

function CloudFilesPage() {
  return (
    <Inside title="Cloud Files" breadcrumbs={[{ label: "Cloud Files" }]}>
      <CloudFilesManage />
    </Inside>
  )
}
