import { createFileRoute } from "@tanstack/react-router"
import { Inside } from "../components/Inside"
import { Preferences } from "../components/Preferences"

export const Route = createFileRoute("/preferences")({
  ssr: false,
  loader: async () => true,
  component: PreferencesPage,
})

function PreferencesPage() {
  return (
    <Inside title="Preferences" breadcrumbs={[{ label: "Preferences" }]}>
      <Preferences />
    </Inside>
  )
}