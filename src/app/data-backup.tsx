import { createFileRoute } from "@tanstack/react-router"
import { DataBackupManage } from "../components/DataBackupManage"
import { Inside } from "../components/Inside"

export const Route = createFileRoute("/data-backup")({
  ssr: false,
  loader: async () => true,
  component: DataBackupPage,
})

function DataBackupPage() {
  return (
    <Inside title="Data Backup" breadcrumbs={[{ label: "Data Backup" }]}>
      <DataBackupManage />
    </Inside>
  )
}